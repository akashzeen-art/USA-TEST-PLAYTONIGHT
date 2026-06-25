import { useEffect } from 'react';

interface TrackingScriptsProps {
  headtag?: string | null;
  bodytag?: string | null;
}

const TrackingScripts: React.FC<TrackingScriptsProps> = ({ headtag, bodytag }) => {
  useEffect(() => {
    console.log('🔍 Headtag value:', headtag);
    if (headtag && typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.innerHTML = headtag;
      console.log('📦 Head nodes:', container.childNodes.length);
      
      Array.from(container.childNodes).forEach((node, i) => {
        console.log(`Node ${i}: type=${node.nodeType}, tag=${node.nodeName}`);
        if (node.nodeType === 1 && (node as Element).tagName === 'SCRIPT') {
          const script = node as HTMLScriptElement;
          const newScript = document.createElement('script');
          if (script.src) newScript.src = script.src;
          if (script.innerHTML) newScript.innerHTML = script.innerHTML;
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          document.head.appendChild(newScript);
          console.log('✅ Script injected to head');
        } else if (node.nodeType === 8) {
          document.head.appendChild(node.cloneNode(true));
          console.log('✅ Comment injected to head');
        }
      });
    }
  }, [headtag]);

  useEffect(() => {
    console.log('🔍 Bodytag value:', bodytag);
    if (bodytag && typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.innerHTML = bodytag;
      console.log('📦 Body nodes:', container.childNodes.length);
      
      Array.from(container.childNodes).forEach((node, i) => {
        console.log(`Node ${i}: type=${node.nodeType}, tag=${node.nodeName}`);
        if (node.nodeType === 1 && (node as Element).tagName === 'SCRIPT') {
          const script = node as HTMLScriptElement;
          const newScript = document.createElement('script');
          if (script.src) newScript.src = script.src;
          if (script.innerHTML) newScript.innerHTML = script.innerHTML;
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          document.body.insertBefore(newScript, document.body.firstChild);
          console.log('✅ Script injected to body');
        } else if (node.nodeType === 8) {
          document.body.insertBefore(node.cloneNode(true), document.body.firstChild);
          console.log('✅ Comment injected to body');
        }
      });
    }
  }, [bodytag]);

  return null;
};

export default TrackingScripts;
