import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useNetwork } from 'wagmi'
import { mainnet, goerli } from '@wagmi/core/chains'
import { validChain } from '../lib/utils'

const defaultChains = [mainnet, goerli]

export function useChain(provider) {
  const [hasProvider, setHasProvider] = useState(false)
  const [isChainSupported, setChainSupported] = useState(false)
  const [providerChain, setProviderChain] = useState(0)
  const { chain: walletChain, chains: walletChains } = useNetwork()

  provider.getNetwork().then(network => {
    if (network && providerChain !== network.chainId) {
      setProviderChain(network.chainId)
    }
  })

  const chain = walletChain ? walletChain.id : providerChain
  const chains = walletChain ? walletChains : defaultChains

  useEffect(() => {
    setHasProvider(!!chain)
    setChainSupported(validChain(chain, chains))
  }, [chain, chains])

  return {
    chain,
    chains,
    hasProvider,
    isChainSupported
  }
}

export function useDelayedName(name) {
  const [delayedName, setDelayedName] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => setDelayedName(name), 500);
    return () => clearTimeout(timeoutId);
  }, [name, setDelayedName]);

  return delayedName
}

function routerPush(router, name, basePath) {
  let encodedName = ''
  if (name && name.length > 0) {
    while (name.length > 0 && name.charAt(0) === ' ') {
      name = name.substring(1)
    }
    while (name.length > 0 && name.charAt(name.length - 1) === ' ') {
      name = name.substring(0, name.length - 1)
    }
    if (name !== '..') {
      encodedName = encodeURIComponent(name)
    }
  }
  
  router.push(basePath + encodedName, undefined, { shallow: true })

  return name
}

export function useRouterPush(basePath, setName) {
  const [routerQuery, setRouterQuery] = useState('')
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const { name: names } = router.query
  if (names && names.length) {
    const joined = names.join('/')
    if (routerQuery !== joined) {
      setRouterQuery(joined)
    }
  }

  const onRouterQueryInit = useCallback((name) => {
    setName(routerPush(router, name, basePath))
  }, [router, basePath, setName])

  useEffect(() => {
    if (routerQuery && !initialized) {
      setInitialized(true)
      let tname = document.getElementsByName('tname')
      if (tname && tname.length) {
        tname[0].value = routerQuery
      }
      onRouterQueryInit(routerQuery)
    }
  }, [routerQuery, initialized, onRouterQueryInit])

  return (name) => {
    setName(routerPush(router, name, basePath))
  }
}

const exports = {
  useChain,
  useDelayedName,
  useRouterPush
}
export default exports
