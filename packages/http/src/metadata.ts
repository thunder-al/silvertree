import {getClassMetadata, Inject, isClassInstance, tapClassMetadata} from '@silvertree/core'
import {
  HTTP_FASTIFY_REPLY_INJECT_KEY,
  HTTP_FASTIFY_REQUEST_EXTRACT_INJECT_KEY,
  HTTP_FASTIFY_REQUEST_INJECT_KEY,
  HTTP_LOCAL_FASTIFY_INJECT_KEY,
  HTTP_ROUTES_METADATA_KEY,
  HTTP_ROUTES_MODIFIERS_METADATA_KEY,
  HTTP_SETUP_METADATA_KEY,
} from './const'
import {
  IHttpControllerRouteMetadataItem,
  IHttpControllerRouteModifierMetadataItem,
  IHttpControllerSetupMetadataItem,
} from './types'
import {FastifyRequest, RouteOptions} from 'fastify'
import {FastifySchema} from 'fastify/types/schema'
import {RouteShorthandOptions} from 'fastify/types/route'

/**
 * Marks method as http route handler.
 * In `fastify.route` style.
 * @see https://fastify.dev/docs/latest/Reference/Routes/#full-declaration
 * @example
 * ```typescript
 * @HttpRoute({
 *   method: 'GET',
 *   url: '/hello',
 *   '//': 'other options'
 * })
 * async hello() { ... }
 *  ```
 */
export function HttpRoute(
  route: Omit<RouteOptions, 'handler'>,
): PropertyDecorator

/**
 * Marks method as http route handler.
 * Method and url as arguments.
 * The rest of the options are passed as an object.
 * @see https://fastify.dev/docs/latest/Reference/Routes/#full-declaration
 * @example
 * ```typescript
 * @HttpRoute('GET', '/hello', {'//': 'other fastify options'})
 * async hello() { ... }
 *  ```
 */
export function HttpRoute(
  method: RouteOptions['method'],
  url: RouteOptions['url'],
  route?: Omit<RouteOptions, 'handler' | 'method' | 'url'>,
): PropertyDecorator

/**
 * Marks method as http route handler.
 * @see https://fastify.dev/docs/latest/Reference/Routes/#full-declaration
 * @example
 * ```typescript
 * // method and url as arguments.
 * // the rest of the options are passed as an object
 * @HttpRoute('GET', '/hello', {})
 *
 * // method as arguments.
 * // url and the rest of the options are passed as an object
 * @HttpRoute('GET', {url: '/hello'})
 *
 * // method, url and the rest of the options are passed as an object (fastify.route style)
 * @HttpRoute({method: 'GET', url: '/hello'})
 * ```
 */
export function HttpRoute(
  method: RouteOptions['method'] | Omit<RouteOptions, 'handler'>,
  url?: RouteOptions['url'] | Omit<RouteOptions, 'handler' | 'method'>,
  route?: Omit<RouteOptions, 'handler' | 'method' | 'url'>,
): PropertyDecorator {

  const computedRoute: Partial<Omit<RouteOptions, 'handler'>> = {}

  if (typeof method !== 'string' && !Array.isArray(method)) {
    // HttpRoute({...})
    Object.assign(computedRoute, method)

  } else {
    // HttpRoute('METHOD')
    computedRoute.method = method

    if (!url) {
      throw new Error('HttpRoute: url is required')
    }

    if (typeof url !== 'string') {
      // HttpRoute('METHOD', {...})
      Object.assign(computedRoute, url)

    } else {
      // HttpRoute('METHOD', '/url')
      computedRoute.url = url

      if (route) {
        // HttpRoute('METHOD', '/url', {...})
        Object.assign(computedRoute, route)
      }
    }
  }

  return function (target: Object, propertyKey: string | symbol) {
    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    // noinspection SuspiciousTypeOfGuard
    if (typeof propertyKey === 'symbol') {
      throw new Error('HttpRoute: symbol property keys are not supported')
    }

    tapClassMetadata(
      target,
      HTTP_ROUTES_METADATA_KEY,
      (routes: Array<IHttpControllerRouteMetadataItem> = []) => {
        routes.push({
          m: propertyKey.toString(),
          r: computedRoute as Omit<RouteOptions, 'handler'>,
        })

        return routes
      },
    )
  }
}

/**
 * Get HTTP routes metadata for controller class
 * @param target
 */
export function getHttpRoutesMetadata(target: Object): Array<IHttpControllerRouteMetadataItem> {
  return getClassMetadata(target, HTTP_ROUTES_METADATA_KEY, false) ?? []
}

/**
 * Modifies route options before adding it to the fastify instance.
 * Execution order is not guaranteed.
 */
export function HttpRouteModify(func: IHttpControllerRouteModifierMetadataItem['f']): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    // noinspection SuspiciousTypeOfGuard
    if (typeof propertyKey === 'symbol') {
      throw new Error('HttpRouteModify: symbol property keys are not supported')
    }

    tapClassMetadata(
      target,
      HTTP_ROUTES_MODIFIERS_METADATA_KEY,
      (modifiers: Array<IHttpControllerRouteModifierMetadataItem> = []) => {
        modifiers.push({
          m: propertyKey,
          f: func,
        })

        return modifiers
      },
    )
  }
}

/**
 * Get HTTP route modifiers for controller class
 */
export function getHttpRouteModifiers(target: Object): Array<IHttpControllerRouteModifierMetadataItem> {
  return getClassMetadata(target, HTTP_ROUTES_MODIFIERS_METADATA_KEY, false) ?? []
}

/**
 * Marks method as setup function for configuring the fastify in current controller.
 */
export function HttpControllerSetup(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    tapClassMetadata(
      target,
      HTTP_SETUP_METADATA_KEY,
      (routes: Array<IHttpControllerSetupMetadataItem> = []) => {
        routes.push({
          m: propertyKey.toString(),
        })

        return routes
      },
    )
  }
}

/**
 * Get HTTP setup metadata for controller class
 * @param target
 */
export function getHttpControllerSetupMetadata(target: Object): Array<IHttpControllerSetupMetadataItem> {
  return getClassMetadata(target, HTTP_SETUP_METADATA_KEY, false) ?? []
}

/**
 * Injects http server instance into controller setup function or route methods as argument.
 */
export function InjectHttpServer(): ParameterDecorator {
  return Inject(HTTP_LOCAL_FASTIFY_INJECT_KEY)
}

/**
 * Injects http request instance into route methods as argument.
 */
export function InjectHttpRequest(): ParameterDecorator {
  return Inject(HTTP_FASTIFY_REQUEST_INJECT_KEY)
}

/**
 * Injects http reply instance into route methods as argument.
 */
export function InjectHttpReply(): ParameterDecorator {
  return Inject(HTTP_FASTIFY_REPLY_INJECT_KEY)
}

/**
 * Injects http request part into route methods as argument.
 */
export function InjectHttpRequestPart(
  extractor: (request: FastifyRequest) => any,
): ParameterDecorator {
  return Inject(HTTP_FASTIFY_REQUEST_EXTRACT_INJECT_KEY, {extractor})
}

/**
 * Injects http request body into route methods as argument.
 */
export function InjectHttpBody(): ParameterDecorator {
  return InjectHttpRequestPart((request) => request.body)
}

/**
 * Injects http request query into route methods as argument.
 */
export function InjectHttpQuery(): ParameterDecorator {
  return InjectHttpRequestPart((request) => request.query)
}

/**
 * Configure route schema for validation.
 * @see https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
 */
export function HttpRouteSchema(part: keyof FastifySchema | string, schema: any) {
  return HttpRouteModify(route => {
    if (!route.schema) {
      route.schema = {}
    }

    // if you're providing a non FastifySchema key, you should know what you are doing (:
    // @ts-ignore
    route.schema[part] = schema
  })
}

/**
 * Configure route hooks or function like properties.
 */
export function HttpRouteHook<
  T extends keyof Omit<RouteShorthandOptions, 'schema' | 'attachValidation' | 'exposeHeadRoute' | 'bodyLimit' | 'logLevel' | 'config' | 'version' | 'constraints' | 'prefixTrailingSlash'>
>(hook: T, handler: RouteShorthandOptions[T]) {
  return HttpRouteModify((route: RouteShorthandOptions) => {
    route[hook] = handler
  })
}
