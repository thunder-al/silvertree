import {getClassMetadata, Inject, isClassInstance, tapClassMetadata} from '@silvertree/core'
import {HTTP_LOCAL_FASTIFY_INJECT_KEY, HTTP_ROUTES_METADATA_KEY, HTTP_SETUP_METADATA_KEY} from './const'
import {IHttpControllerRouteMetadataItem, IHttpControllerSetupMetadataItem} from './types'
import {RouteOptions} from 'fastify'

export function HttpRoute(
  route: Omit<RouteOptions, 'handler'>,
): PropertyDecorator
export function HttpRoute(
  method: RouteOptions['method'],
  url: RouteOptions['url'],
  route?: Omit<RouteOptions, 'handler' | 'method' | 'url'>,
): PropertyDecorator
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
