/* Cube token icon: swaps the coin emoji for the site's own token mark wherever it appears in the page. */
(function(){
var CH='🪙', SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,OPTION:1,TITLE:1,INPUT:1};
function fix(n){ if(!n.parentNode||SKIP[n.parentNode.nodeName]||(n.parentNode.isContentEditable)) return; var t=n.nodeValue, i=t.indexOf(CH); if(i<0) return;
  var parts=t.split(CH), f=document.createDocumentFragment(); parts.forEach(function(p,k){ if(k){ var s=document.createElement('span'); s.className='ctk'; s.setAttribute('role','img'); s.setAttribute('aria-label','tokens'); f.appendChild(s); } if(p) f.appendChild(document.createTextNode(p)); }); n.parentNode.replaceChild(f,n); }
function sweep(root){ if(root.nodeType===3){ fix(root); return; } if(root.nodeType!==1||SKIP[root.nodeName]) return; if((root.textContent||'').indexOf(CH)<0) return; var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), a=[], x; while((x=w.nextNode())) if(x.nodeValue.indexOf(CH)>=0) a.push(x); a.forEach(fix); }
function go(){ sweep(document.body); new MutationObserver(function(ms){ for(var i=0;i<ms.length;i++){ var m=ms[i]; if(m.type==='characterData') fix(m.target); else for(var j=0;j<m.addedNodes.length;j++) sweep(m.addedNodes[j]); } }).observe(document.body,{childList:true,subtree:true,characterData:true}); }
if(document.body) go(); else document.addEventListener('DOMContentLoaded',go);
})();
