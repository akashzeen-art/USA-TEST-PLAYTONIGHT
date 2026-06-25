import { useEffect } from 'react'

/**
 * Component to inject headtag and bodytag dynamically from product API response
 */
const TrackingScripts = ({ headtag, bodytag }) => {
  useEffect(() => {
    console.log('🔍 Home Headtag:', headtag);
    if (headtag) {
      const headContainer = document.head || document.getElementsByTagName('head')[0]
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = headtag
      console.log('📦 Home Head nodes:', tempDiv.childNodes.length);
      
      Array.from(tempDiv.childNodes).forEach((node, i) => {
        console.log(`Home Node ${i}: type=${node.nodeType}, tag=${node.nodeName}`);
        if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
          const newScript = document.createElement('script')
          if (node.src) newScript.src = node.src
          if (node.innerHTML) newScript.innerHTML = node.innerHTML
          Array.from(node.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value)
          })
          headContainer.appendChild(newScript)
          console.log('✅ Home Script injected to head');
        } else if (node.nodeType === 8) {
          headContainer.appendChild(node.cloneNode(true))
          console.log('✅ Home Comment injected to head');
        }
      })
    }

    console.log('🔍 Home Bodytag:', bodytag);
    if (bodytag) {
      const body = document.body || document.getElementsByTagName('body')[0]
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = bodytag
      console.log('📦 Home Body nodes:', tempDiv.childNodes.length);
      
      Array.from(tempDiv.childNodes).forEach((node, i) => {
        console.log(`Home Node ${i}: type=${node.nodeType}, tag=${node.nodeName}`);
        if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
          const newScript = document.createElement('script')
          if (node.src) newScript.src = node.src
          if (node.innerHTML) newScript.innerHTML = node.innerHTML
          Array.from(node.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value)
          })
          body.insertBefore(newScript, body.firstChild)
          console.log('✅ Home Script injected to body');
        } else if (node.nodeType === 8) {
          body.insertBefore(node.cloneNode(true), body.firstChild)
          console.log('✅ Home Comment injected to body');
        }
      })
    }
  }, [headtag, bodytag])

  return null
}

export default TrackingScripts
