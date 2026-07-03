import {
  GraphResultSet,
  IIndexService,
  MedusaContainer,
  RemoteJoinerOptions,
  RemoteJoinerQuery,
  RemoteQueryFilters,
  RemoteQueryFunction,
  RemoteQueryFunctionReturnPagination,
  RemoteQueryInput,
  RemoteQueryObjectConfig,
  RemoteQueryObjectFromStringResult,
} from "@medusajs/types"
import {
  MedusaError,
  applyTranslations,
  GraphQLUtils,
  Cached,
  isObject,
  remoteQueryObjectFromString,
  unflattenObjectKeys,
} from "@medusajs/utils"
import { queryCacheDecoratorOptions } from "./cache"
import { RemoteQuery } from "./remote-query"
import { toRemoteQuery } from "./to-remote-query"

/**
 * API wrapper around the remoteQuery
 */
export class Query {
  #remoteQuery: RemoteQuery
  #indexModule: IIndexService
  protected container: MedusaContainer

  /**
   * Method to wrap execution of the graph query for instrumentation
   */
  static traceGraphQuery?: (
    queryFn: () => Promise<any>,
    queryOptions: RemoteQueryInput<any>
  ) => Promise<any>

  /**
   * Method to wrap execution of the remoteQuery overload function
   * for instrumentation
   */
  static traceRemoteQuery?: (
    queryFn: () => Promise<any>,
    queryOptions:
      | RemoteQueryObjectConfig<any>
      | RemoteQueryObjectFromStringResult<any>
      | RemoteJoinerQuery
  ) => Promise<any>

  static instrument = {
    graphQuery(tracer: (typeof Query)["traceGraphQuery"]) {
      Query.traceGraphQuery = tracer
    },
    remoteQuery(tracer: (typeof Query)["traceRemoteQuery"]) {
      Query.traceRemoteQuery = tracer
    },
    remoteDataFetch(tracer: (typeof RemoteQuery)["traceFetchRemoteData"]) {
      RemoteQuery.traceFetchRemoteData = tracer
    },
  }

  static parseGraphqlQuery(
    graphqlQuery: string,
    variables?: Record<string, unknown>
  ): RemoteJoinerQuery {
    const parser = new GraphQLUtils.GraphQLParser(graphqlQuery, variables)
    return parser.parseQuery()
  }

  constructor({
    remoteQuery,
    indexModule,
    container,
  }: {
    remoteQuery: RemoteQuery
    indexModule: IIndexService
    container: MedusaContainer
  }) {
    this.#remoteQuery = remoteQuery
    this.#indexModule = indexModule
    this.container = container
  }

  async query(
    queryOptions:
      | RemoteQueryInput<any>
      | RemoteQueryObjectConfig<any>
      | RemoteQueryObjectFromStringResult<any>
      | RemoteJoinerQuery,
    options?: RemoteJoinerOptions
  ) {
    if (!isObject(queryOptions)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid query, expected object and received something else."
      )
    }

    let config: any = queryOptions

    if ("__value" in queryOptions) {
      config = queryOptions.__value
    } else if ("entity" in config) {
      config = toRemoteQuery(config, this.#remoteQuery.getJoinerConfigs())
    } else if ("entryPoint" in config || "service" in config) {
      config = remoteQueryObjectFromString(
        config as Parameters<typeof remoteQueryObjectFromString>[0]
      ).__value
    }

    if (Query.traceRemoteQuery) {
      return await Query.traceRemoteQuery(
        async () => await this.#remoteQuery.query(config, undefined, options),
        queryOptions
      )
    }

    return await this.#remoteQuery.query(config, undefined, options)
  }

  /**
   * Query wrapper to provide specific GraphQL like API around remoteQuery.query
   * @param query
   * @param variables
   * @param options
   */
  async gql(
    query: string,
    variables?: Record<string, unknown>,
    options?: RemoteJoinerOptions
  ) {
    const joinerQuery = Query.parseGraphqlQuery(query, variables)
    return await this.#remoteQuery.query(joinerQuery, undefined, options)
  }

  /**
   * Graph function uses the remoteQuery under the hood and
   * returns a result set
   */
  @Cached(queryCacheDecoratorOptions)
  async graph<const TEntry extends string>(
    queryOptions: RemoteQueryInput<TEntry>,
    options?: RemoteJoinerOptions
  ): Promise<GraphResultSet<TEntry>> {
    const normalizedQuery = toRemoteQuery(
      queryOptions,
      this.#remoteQuery.getJoinerConfigs()
    )

    let response:
      | any[]
      | { rows: any[]; metadata: RemoteQueryFunctionReturnPagination }

    /**
     * When traceGraphQuery method is defined, we will wrap the implementation
     * inside a callback and provide the method to the traceGraphQuery
     */
    if (Query.traceGraphQuery) {
      response = await Query.traceGraphQuery(
        async () =>
          await this.#remoteQuery.query(normalizedQuery, undefined, options),
        queryOptions as RemoteQueryInput<any>
      )
    } else {
      response = await this.#remoteQuery.query(
        normalizedQuery,
        undefined,
        options
      )
    }

    let result: GraphResultSet<any>

    if (Array.isArray(response)) {
      result = { data: response, metadata: undefined }
    } else {
      result = {
        data: response.rows,
        metadata: response.metadata,
      }
    }

    if (options?.locale) {
      await applyTranslations({
        localeCode: options.locale,
        objects: result.data,
        container: this.container,
      })
    }

    return result
  }

  /**
   * Index function uses the Index module to query and hydrates the data with query.graph
   * returns a result set
   */
  @Cached(queryCacheDecoratorOptions)
  async index<const TEntry extends string>(
    queryOptions: RemoteQueryInput<TEntry> & {
      joinFilters?: RemoteQueryFilters<TEntry>
    },
    options?: RemoteJoinerOptions
  ): Promise<GraphResultSet<TEntry>> {
    if (!this.#indexModule) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Index module is not loaded."
      )
    }

    const mainEntity = queryOptions.entity

    const fields = [mainEntity + ".id"]
    const filters = queryOptions.filters
      ? { [mainEntity]: queryOptions.filters }
      : ({} as any)
    const joinFilters = queryOptions.joinFilters
      ? { [mainEntity]: queryOptions.joinFilters }
      : ({} as any)
    const pagination = queryOptions.pagination as any
    if (pagination?.order) {
      pagination.order = {
        [mainEntity]: unflattenObjectKeys(pagination?.order),
      }
    }

    const indexResponse = (await this.#indexModule.query({
      fields,
      filters,
      joinFilters,
      pagination,
      idsOnly: true,
    })) as unknown as GraphResultSet<TEntry>

    delete queryOptions.filters

    const idFilters = {
      id: indexResponse.data.map((item) => item.id),
    } as any

    queryOptions.filters = idFilters

    const graphOptions: RemoteQueryInput<TEntry> = {
      ...queryOptions,
      pagination: {
        // We pass through `take` to force the `select-in` query strategy
        //   There might be a better way to do this, but for now this should do
        take: queryOptions.pagination?.take ?? indexResponse.data.length,
      },
    }

    let finalResultset: GraphResultSet<TEntry> = indexResponse

    if (indexResponse.data.length) {
      finalResultset = await this.graph(graphOptions, {
        ...options,
        initialData: indexResponse.data,
      })
    }

    if (options?.locale) {
      await applyTranslations({
        localeCode: options.locale,
        objects: finalResultset.data,
        container: this.container,
      })
    }

    return {
      data: finalResultset.data,
      metadata: indexResponse.metadata as RemoteQueryFunctionReturnPagination,
    }
  }
}

/**
 * API wrapper around the remoteQuery with backward compatibility support
 * @param remoteQuery
 */
export function createQuery({
  remoteQuery,
  indexModule,
  container,
}: {
  remoteQuery: RemoteQuery
  indexModule: IIndexService
  container: MedusaContainer
}) {
  const query = new Query({
    remoteQuery,
    indexModule,
    container,
  })

  function backwardCompatibleQuery(...args: any[]) {
    return query.query.apply(query, args)
  }

  backwardCompatibleQuery.graph = query.graph.bind(query)
  backwardCompatibleQuery.gql = query.gql.bind(query)
  backwardCompatibleQuery.index = query.index.bind(query)

  return backwardCompatibleQuery as Omit<RemoteQueryFunction, symbol>
}
