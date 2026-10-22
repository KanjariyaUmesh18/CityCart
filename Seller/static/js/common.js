/* CityCart shared behaviour. FRONTEND DEMO: state lives in localStorage only; there is no backend. */
(function(){
  'use strict';
  const mem={};
  const store={
    get(k,d){try{const v=localStorage.getItem('cc_'+k);return v===null?(k in mem?mem[k]:d):JSON.parse(v)}catch(e){return k in mem?mem[k]:d}},
    set(k,v){mem[k]=v;try{localStorage.setItem('cc_'+k,JSON.stringify(v))}catch(e){}},
    del(k){delete mem[k];try{localStorage.removeItem('cc_'+k)}catch(e){}}
  };
  const root=document.body.dataset.root||'';
  const D=window.CCDATA||{shops:[],products:[],cats:[],reviews:[],orders:[],addresses:[],user:{}};
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const OK=['Active','Approved','Delivered','Paid','Completed','Live','Open','Resolved','Verified','Success','Published','Settled','Enabled'],BAD=['Cancelled','Rejected','Failed','Suspended','Closed','Removed','Out of stock','Refunded','Hidden','Overdue','Disabled','Returned'],INFO=['Dispatched','Ready for pickup','Accepted','Out for delivery','Scheduled','Draft','Inactive'];
  const badge=st=>{const c=OK.includes(st)?['badge-open','fa-circle-check']:BAD.includes(st)?['badge-closed','fa-circle-xmark']:INFO.includes(st)?['badge-info','fa-circle-info']:['badge-warn','fa-clock'];return `<span class="badge-cc ${c[0]}" data-st><i class="fa-solid ${c[1]}" aria-hidden="true"></i> ${esc(st)}</span>`};
  const CC=window.CC={store,D,root,$,$$,inr,esc,badge,
    shop:id=>D.shops.find(s=>s.id===id),prod:id=>D.products.find(p=>p.id===id),
    src:(f,n)=>{const P=D.photos||[],m=/^(.*)-[23]$/.exec(n);return P.includes(f+'/'+n)?`${root}assets/images/photos/${f}/${n}.webp`:(m&&P.includes(f+'/'+m[1]))?`${root}assets/images/photos/${f}/${m[1]}.webp`:`${root}assets/images/${f}/${n}.svg`},
    img:(f,n,alt,cls)=>`<img src="${CC.src(f,n)}" alt="${esc(alt)}" width="400" height="300" loading="lazy"${cls?` class="${cls}"`:''}>`};
  CC.toast=function(msg){
    let w=$('.toast-wrap');
    if(!w){w=document.createElement('div');w.className='toast-wrap';w.setAttribute('role','status');w.setAttribute('aria-live','polite');document.body.appendChild(w)}
    const t=document.createElement('div');t.className='cc-toast';t.textContent=msg;w.appendChild(t);setTimeout(()=>t.remove(),2800);
  };
  CC.confirm=function(msg,onOk,o={}){
    let m=$('#ccConfirm');
    if(!m){m=document.createElement('div');m.id='ccConfirm';m.className='modal fade';m.tabIndex=-1;m.setAttribute('aria-labelledby','ccConfirmT');m.setAttribute('aria-hidden','true');
      m.innerHTML='<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h2 class="modal-title h5" id="ccConfirmT"></h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn-cc btn-outline-cc btn-sm-cc" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn-cc btn-primary-cc btn-sm-cc" data-ok></button></div></div></div>';document.body.appendChild(m)}
    $('.modal-title',m).textContent=o.title||'Please confirm';$('.modal-body',m).textContent=msg;
    const ok=$('[data-ok]',m);ok.textContent=o.ok||'Confirm';const nb=ok.cloneNode(true);ok.replaceWith(nb);
    if(!window.bootstrap){if(window.confirm(msg))onOk();return}
    const bm=bootstrap.Modal.getOrCreateInstance(m);nb.addEventListener('click',()=>{bm.hide();onOk()});bm.show();
  };
  const SEED=[{id:'p1',qty:2},{id:'p2',qty:1},{id:'p17',qty:1}];
  CC.cart=()=>{let c=store.get('cart',null);if(c===null){c=JSON.parse(JSON.stringify(SEED));store.set('cart',c)}return c};
  CC.feeFor=s=>{const hi=['Handicrafts','Gifts','Electronics'].includes(s.cat);return{fee:hi?60:40,free:hi?1000:500}};
  CC.totals=function(cart,fulfil){
    fulfil=fulfil||store.get('fulfil',{});const g={};
    cart.forEach(i=>{const p=CC.prod(i.id);if(!p)return;(g[p.shop]=g[p.shop]||{shop:CC.shop(p.shop),rows:[],sub:0}).rows.push({p,qty:i.qty,v:i.v,line:p.price*i.qty});g[p.shop].sub+=p.price*i.qty});
    let sub=0,del=0;const groups=Object.values(g);
    groups.forEach(x=>{const f=CC.feeFor(x.shop);x.mode=fulfil[x.shop.id]||'delivery';x.fee=x.mode==='pickup'?0:(x.sub>=f.free?0:f.fee);x.rule=f;sub+=x.sub;del+=x.fee});
    return{groups,sub,del,total:sub+del};
  };
  function updateCounts(){
    const c=(store.get('cart',null)===null?SEED:store.get('cart',[])).reduce((n,i)=>n+i.qty,0),w=store.get('wish',[]).length;
    $$('[data-cart-count]').forEach(e=>{e.textContent=c;e.hidden=!c});$$('[data-wish-count]').forEach(e=>{e.textContent=w;e.hidden=!w});
  }
  CC.updateCounts=updateCounts;
  CC.syncWish=function(r){const w=store.get('wish',[]);$$('.wish',r||document).forEach(b=>b.setAttribute('aria-pressed',w.includes(b.dataset.id)))};
  // product card (JS twin of the generated markup)
  CC.pcard=function(p,col){
    const s=CC.shop(p.shop),old=p.old,disc=old?`<span class="badge-cc badge-warn">${Math.round((old-p.price)*100/old)}% off</span>`:`<span class="badge-cc pill-local">${p.tag}</span>`;
    const btn=p.stock?`<button class="btn-cc btn-green-cc btn-sm-cc mt-2" type="button" data-add-cart="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to cart</button>`:`<button class="btn-cc btn-outline-cc btn-sm-cc mt-2" type="button" disabled>Currently unavailable</button>`;
    return `<div class="${col||'col-6 col-md-4 col-lg-3'}"><article class="cc-card"><div class="media"><a href="${root}customer/product-details.html?id=${p.id}" tabindex="-1" aria-hidden="true">${CC.img('products',p.id,p.name)}</a>${disc}<button class="wish" type="button" data-id="${p.id}" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist"><i class="fa-solid fa-heart"></i></button></div><div class="body"><h3 class="title"><a class="stretch-none" href="${root}customer/product-details.html?id=${p.id}">${esc(p.name)}</a></h3><div class="meta"><a href="${root}customer/shop-details.html?id=${s.id}"><i class="fa-solid fa-store"></i> ${esc(s.name)}</a> · ${s.area}</div>${p.stock&&p.stock<=5?`<div><span class="badge-cc badge-warn">Only ${p.stock} left</span></div>`:''}<div class="d-flex justify-content-between align-items-center mt-auto pt-2"><span class="price">${inr(p.price)}${old?`<s>${inr(old)}</s>`:''}</span><span class="rating"><i class="fa-solid fa-star"></i> ${p.rating}</span></div>${btn}</div></article></div>`;
  };
  CC.scard=function(s,col){
    const st=s.open?'<span class="badge-cc badge-open"><i class="fa-solid fa-circle-check"></i> Open now</span>':'<span class="badge-cc badge-closed"><i class="fa-regular fa-clock"></i> Closed now</span>';
    return `<div class="${col||'col-12 col-sm-6 col-lg-4'}"><article class="cc-card shop-card"><div class="media">${CC.img('shops',s.id,s.name+' storefront')}<img class="logo-chip" src="${root}assets/images/shops/${s.id}-logo.svg" alt="" width="44" height="44"></div><div class="body pt-3"><div class="d-flex justify-content-between gap-2"><h3 class="title">${esc(s.name)}</h3><span class="rating"><i class="fa-solid fa-star"></i> ${s.rating}</span></div><div class="meta">${s.spec}</div><div class="meta"><i class="fa-solid fa-location-dot"></i> ${s.area}, ${s.city} · ${s.cat}</div><div class="d-flex justify-content-between align-items-center mt-auto pt-2">${st}<a href="${root}customer/shop-details.html?id=${s.id}" class="btn-cc btn-outline-cc btn-sm-cc">Visit shop</a></div></div></article></div>`;
  };
  // image fallback: never leave a broken-image icon
  document.addEventListener('error',e=>{
    const i=e.target;if(!(i instanceof HTMLImageElement)||i.dataset.fb)return;i.dataset.fb=1;
    i.src='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#EFE5D2"/><path d="M200 110l40 40-40 40-40-40z" fill="none" stroke="#E87524" stroke-width="4"/><text x="200" y="240" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#7A675B">CityCart</text></svg>');
  },true);
  document.addEventListener('DOMContentLoaded',()=>{
    const city=store.get('city',null);if(city)$$('[data-city-label]').forEach(e=>e.textContent=city);
    const u=store.get('user',null);if(u)$$('[data-account-link]').forEach(a=>{a.href=root+'customer/profile.html';a.setAttribute('aria-label','My account')});
    // delegated actions (work for JS-rendered content too)
    document.addEventListener('click',e=>{
      const w=e.target.closest('.wish');
      if(w){e.preventDefault();let l=store.get('wish',[]);const id=w.dataset.id;
        if(l.includes(id)){l=l.filter(x=>x!==id);CC.toast('Removed from wishlist')}else{l.push(id);CC.toast('Saved to wishlist')}
        store.set('wish',l);CC.syncWish();updateCounts();document.dispatchEvent(new CustomEvent('wish-changed'));return}
      const a=e.target.closest('[data-add-cart]');
      if(a){const c=CC.cart(),id=a.dataset.addCart,v=a.dataset.variant||null,it=c.find(i=>i.id===id&&(i.v||null)===v);
        const p=CC.prod(id);if(p&&p.stock&&(it?it.qty:0)>=p.stock){CC.toast('Only '+p.stock+' available in stock');return}
        it?it.qty++:c.push({id,qty:+(a.dataset.qty||1),v});store.set('cart',c);updateCounts();CC.toast('Added to cart (demo)');return}
      const cf=e.target.closest('[data-confirm]');
      if(cf){e.preventDefault();CC.confirm(cf.dataset.confirm,()=>{
          if(cf.dataset.setStatus){const tr=cf.closest('tr,.status-scope');const b=tr&&tr.querySelector('[data-st]');if(b){b.outerHTML=badge(cf.dataset.setStatus);if(tr.dataset.status!==undefined)tr.dataset.status=cf.dataset.setStatus}}
          if(cf.dataset.remove){const t=cf.closest(cf.dataset.remove);t&&t.remove()}
          if(cf.dataset.done)CC.toast(cf.dataset.done);document.dispatchEvent(new CustomEvent('confirmed',{detail:cf}));
          if(cf.dataset.href)setTimeout(()=>location.href=cf.dataset.href,700);
        },{title:cf.dataset.title,ok:cf.dataset.ok});return}
      const tg=e.target.closest('[data-toast]');if(tg){e.preventDefault();CC.toast(tg.dataset.toast)}
    });
    $$('.pw-toggle').forEach(b=>b.addEventListener('click',()=>{
      const i=document.getElementById(b.dataset.target),show=i.type==='password';
      i.type=show?'text':'password';b.setAttribute('aria-label',show?'Hide password':'Show password');b.querySelector('i').className=show?'fa-regular fa-eye-slash':'fa-regular fa-eye'}));
    // form validation (demo)
    $$('form[data-validate]').forEach(f=>f.addEventListener('submit',e=>{
      e.preventDefault();let ok=true;
      $$('input[required],select[required],textarea[required]',f).forEach(i=>{let bad=!i.checkValidity();
        if(i.dataset.match)bad=bad||i.value!==document.getElementById(i.dataset.match).value;
        if(i.dataset.strong&&i.value.length<8)bad=true;
        i.classList.toggle('is-invalid',bad);i.setAttribute('aria-invalid',bad);if(bad)ok=false});
      const first=$('.is-invalid',f);if(first){first.focus();CC.toast('Please fix the highlighted fields');return}
      document.dispatchEvent(new CustomEvent('form-ok',{detail:f}));
      if(f.dataset.noToast===undefined)CC.toast(f.dataset.success||'Saved (demo – no backend connected)');
      if(f.dataset.next)setTimeout(()=>location.href=f.dataset.next,900);
    }));
    $$('form[data-validate] input,form[data-validate] select,form[data-validate] textarea').forEach(i=>i.addEventListener('input',()=>i.classList.remove('is-invalid')));
    CC.syncWish();updateCounts();
  });
})();
