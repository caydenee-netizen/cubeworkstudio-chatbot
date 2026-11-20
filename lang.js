/* Language picker: a small globe button in the top right of every page (shop and /play).
   Uses Google's free page translator for everything on screen; the choice is remembered. Timer digits and cube moves are never translated. */
(function(){
'use strict';
var KEY='cw_lang';
var LANGS=[['en','English'],['hi','हिन्दी · Hindi'],['ta','தமிழ் · Tamil'],['te','తెలుగు · Telugu'],['ml','മലയാളം · Malayalam'],['kn','ಕನ್ನಡ · Kannada'],['bn','বাংলা · Bengali'],['mr','मराठी · Marathi'],['gu','ગુજરાતી · Gujarati'],['pa','ਪੰਜਾਬੀ · Punjabi'],['or','ଓଡ଼ିଆ · Odia'],['as','অসমীয়া · Assamese'],['ur','اردو · Urdu'],['ms','Bahasa Melayu'],['zh-CN','简体中文 · Chinese (Simplified)'],['zh-TW','繁體中文 · Chinese (Traditional)'],['zh-CN','中文 · Chinese']];
function cur(){ try{ return localStorage.getItem(KEY)||'en'; }catch(e){ return 'en'; } }
function cookie(v){ var h=location.hostname, parts=h.split('.'), dom=parts.length>1?'.'+parts.slice(-2).join('.'):h, past='expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if(v){ document.cookie='googtrans='+v+';path=/'; try{ document.cookie='googtrans='+v+';path=/;domain='+dom; }catch(e){} }
  else { document.cookie='googtrans=;path=/;'+past; try{ document.cookie='googtrans=;path=/;domain='+dom+';'+past; document.cookie='googtrans=;path=/;domain='+h+';'+past; }catch(e){} } }
var loaded=false;
function load(){ if(loaded) return; loaded=true; var d=document.createElement('div'); d.id='google_translate_element'; d.className='notranslate'; d.style.cssText='position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden'; document.body.appendChild(d);
  window.cwGT=function(){ try{ new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:LANGS.map(function(l){ return l[0]; }).join(','),autoDisplay:false},'google_translate_element'); }catch(e){} };
  var s=document.createElement('script'); s.src='https://translate.google.com/translate_a/element.js?cb=cwGT'; s.async=true; document.body.appendChild(s); }
function guard(){ /* never translate timer digits, scrambles, times or move notation */
  var q='.tm,.scr,.mono,.times,.stats b,#tNet,#tPrev,code,input,textarea,select';
  document.querySelectorAll(q).forEach(function(e){ if(e.getAttribute('translate')!=='no'){ e.setAttribute('translate','no'); e.classList.add('notranslate'); } }); }
var gt=0; function soon(){ clearTimeout(gt); gt=setTimeout(guard,250); }
function pick(code){ try{ localStorage.setItem(KEY,code); }catch(e){}
  if(code==='en') cookie(''); else cookie('/en/'+code); location.reload(); }
function open(){ var c=cur(), sh=CW.sheet('<div class="hd"><h2>Language</h2><button class="x" data-close aria-label="Close">✕</button></div>'
  +'<div class="list langlist notranslate" translate="no">'+LANGS.map(function(l){ return '<button type="button" class="btn wide" data-l="'+l[0]+'" aria-pressed="'+(l[0]===c)+'" style="justify-content:flex-start;margin-bottom:6px">'+(l[0]===c?'✓ ':'')+l[1]+'</button>'; }).join('')+'</div>'
  +'<p class="muted" style="font-size:12.5px;margin-top:8px">Bahasa Melayu is hand-written for the shop and Cuber Tools. Other languages are translated automatically by Google Translate, so some words may not be perfect.</p>');
  sh.addEventListener('click',function(e){ var b=e.target.closest('[data-l]'); if(b) pick(b.getAttribute('data-l')); }); }
function mount(){ var t=document.querySelector('.themebtn'); if(!t||document.getElementById('langBtn')) return;
  var b=document.createElement('button'); b.type='button'; b.id='langBtn'; b.className='themebtn notranslate'; b.setAttribute('translate','no'); b.setAttribute('aria-label','Language'); b.title='Language';
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>';
  b.onclick=open; t.parentNode.insertBefore(b,t); }
var SHOP=!/^\/play/.test(location.pathname);
function msLoad(){ var go=function(){ var s=document.createElement('script'); s.src='/i18n-ms.js?v=2'; document.body.appendChild(s); }; if(SHOP) return go(); var p=document.createElement('script'); p.src='/i18n-ms-play.js?v=1'; p.onload=p.onerror=go; document.body.appendChild(p); }
function init(){ mount(); var c=cur(); if(c==='ms'){ cookie(''); msLoad(); } else if(c!=='en'){ cookie('/en/'+c); document.documentElement.lang=c; load(); } guard(); try{ new MutationObserver(soon).observe(document.body,{childList:true,subtree:true}); }catch(e){} }
if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded',init);
})();
