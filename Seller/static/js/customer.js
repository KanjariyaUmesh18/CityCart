/* Customer-page behaviour: list filters, detail pages, cart, checkout, orders, addresses. Demo only. */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
  const {$,$$,store,D,inr,esc,root,badge}=CC;const page=document.body.dataset.page;const Q=new URLSearchParams(location.search);
  const html=(el,h)=>{if(el)el.innerHTML=h};
  const stars=r=>`<span class="rating"><i class="fa-solid fa-star"></i> ${r}</span>`;
  const notFound=(el,what)=>html(el,`<div class="empty-state"><i class="fa-solid fa-circle-question"></i><h2 class="h5 mt-2">${what} not found</h2><p class="text-muted-cc">The link may be outdated.</p><a class="btn-cc btn-primary-cc" href="${root}index.html">Back to home</a></div>`);

  // ---------- generic filter/sort/paginate grid ----------
  const grid=$('[data-grid]');
  if(grid){
    const items=$$('[data-item]',grid),empty=$('#emptyState'),count=$('#resultCount');
    const st={q:Q.get('q')||'',cats:new Set(),open:false,maker:false,stock:false,maxPrice:null,minRating:0,sort:'relevance',page:1,city:'',area:''};
    const per=+(grid.dataset.perPage||9);const qs=$('#filterQ');if(qs&&st.q)qs.value=st.q;
    const preCat=Q.get('cat');if(preCat)$$('[data-filter-cat]').forEach(c=>{if(c.value===preCat){c.checked=true;st.cats.add(preCat)}});
    const orig=items.map(e=>e.closest('[class*=col]'));
    function apply(){
      let vis=items.filter(el=>{const d=el.dataset;
        if(st.q){const hay=(d.name+' '+d.cat+' '+(d.shop||'')+' '+(d.area||'')).toLowerCase();if(!st.q.toLowerCase().split(/\s+/).every(w=>hay.includes(w)))return false}
        if(st.cats.size&&!st.cats.has(d.cat))return false;if(st.open&&d.open!=='1')return false;if(st.maker&&d.maker!=='1')return false;if(st.stock&&d.stock==='0')return false;
        if(st.maxPrice&&+d.price>st.maxPrice)return false;if(+d.rating<st.minRating)return false;if(st.city&&d.city!==st.city)return false;if(st.area&&d.area!==st.area)return false;return true});
      const key={'price-asc':e=>+e.dataset.price,'price-desc':e=>-e.dataset.price,rating:e=>-e.dataset.rating}[st.sort];if(key)vis.sort((a,b)=>key(a)-key(b));
      const pages=Math.max(1,Math.ceil(vis.length/per));st.page=Math.min(st.page,pages);
      orig.forEach(c=>c.hidden=true);
      vis.slice((st.page-1)*per,st.page*per).forEach(e=>{const c=e.closest('[class*=col]');c.hidden=false;grid.appendChild(c)});
      if(count)count.textContent=vis.length;if(empty)empty.hidden=vis.length>0;
      const pg=$('#pager');if(pg){pg.innerHTML='';pg.hidden=pages<2;for(let i=1;i<=pages;i++){const li=document.createElement('li');li.className='page-item'+(i===st.page?' active':'');li.innerHTML=`<button class="page-link" type="button" aria-label="Page ${i}">${i}</button>`;li.firstChild.onclick=()=>{st.page=i;apply();window.scrollTo({top:grid.offsetTop-140,behavior:'smooth'})};pg.appendChild(li)}}
      CC.syncWish(grid);
    }
    $$('[data-filter-cat]').forEach(c=>c.addEventListener('change',()=>{c.checked?st.cats.add(c.value):st.cats.delete(c.value);st.page=1;apply()}));
    const bind=(id,fn,ev='change')=>{const e=$(id);e&&e.addEventListener(ev,()=>{fn(e);st.page=1;apply()})};
    bind('#filterOpen',e=>st.open=e.checked);bind('#filterMaker',e=>st.maker=e.checked);bind('#filterStock',e=>st.stock=e.checked);
    bind('#filterPrice',e=>{st.maxPrice=+e.value;$('#priceLabel').textContent=inr(+e.value)},'input');
    bind('#filterCity',e=>{st.city=e.value;const a=$('#filterArea');if(a){a.innerHTML='<option value="">All localities</option>'+[...new Set(D.shops.filter(s=>!e.value||s.city===e.value).map(s=>s.area))].sort().map(x=>`<option>${x}</option>`).join('');st.area=''}});
    bind('#filterArea',e=>st.area=e.value);
    $$('[name=rating]').forEach(r=>r.addEventListener('change',()=>{st.minRating=+r.value;st.page=1;apply()}));
    const sort=$('#sortBy');sort&&sort.addEventListener('change',()=>{st.sort=sort.value;apply()});
    qs&&qs.addEventListener('input',()=>{st.q=qs.value;st.page=1;apply()});
    $('#resetFilters')&&$('#resetFilters').addEventListener('click',()=>{location.href=location.pathname});
    apply();
  }

  // ---------- city picker ----------
  const cl=$('#cityList');
  if(cl){
    const areas={'Vadodara':['Alkapuri','Fatehgunj','Manjalpur','Karelibaug','Gotri','Raopura'],'Ahmedabad':['Navrangpura','Maninagar','Satellite','Bopal'],'Surat':['Adajan','Varachha','Athwa'],'Jaipur':['Johari Bazaar','Vaishali Nagar','Malviya Nagar'],'Lucknow':['Hazratganj','Aminabad','Gomti Nagar'],'Pune':['Koregaon Park','Kothrud','Aundh']};
    const al=$('#areaList'),srch=$('#citySearch');let sel=store.get('city','Vadodara');
    const n=c=>D.shops.filter(s=>s.city===c).length;
    function draw(){const t=(srch.value||'').toLowerCase();cl.innerHTML='';
      Object.keys(areas).filter(c=>c.toLowerCase().includes(t)||areas[c].some(a=>a.toLowerCase().includes(t))).forEach(c=>{const b=document.createElement('button');b.type='button';b.className='city-card'+(c===sel?' active':'');b.setAttribute('aria-pressed',c===sel);
        b.innerHTML=`<span>${c}</span><small class="text-muted-cc">${n(c)?n(c)+' sample shops':'Coming soon'}</small>`;b.onclick=()=>{sel=c;draw();drawAreas()};cl.appendChild(b)});
      if(!cl.children.length)cl.innerHTML='<div class="empty-state"><i class="fa-solid fa-map-location-dot"></i><h2 class="h6 mt-2">We are not in that city yet</h2><p class="text-muted-cc mb-0">Try a nearby city, or tell us where to launch next via Contact.</p></div>'}
    function drawAreas(){$('#selCity').textContent=sel;$('#cityNote').textContent=n(sel)?`${n(sel)} sample shops available in ${sel}. Delivery and pickup options vary by shop and locality.`:`CityCart is not live in ${sel} yet. You can still browse, but shops are not available.`;al.innerHTML='';
      areas[sel].forEach(a=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=a;b.onclick=()=>{store.set('city',sel);store.set('area',a);CC.toast(a+', '+sel+' selected');setTimeout(()=>location.href='explore-shops.html',700)};al.appendChild(b)})}
    srch.addEventListener('input',draw);draw();drawAreas();
  }

  // ---------- product details ----------
  if(page==='product-details'){
    const p=CC.prod(Q.get('id')||'p4'),el=$('#pd');
    if(!p)notFound(el,'Product');else{
      const s=CC.shop(p.shop);document.title=p.name+' · CityCart';
      let variant=p.variant?p.variant.opts[0]:null,qty=1;
      const rel=D.products.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4),more=D.products.filter(x=>x.shop===p.shop&&x.id!==p.id).slice(0,4);
      const stockLbl=p.stock===0?'<span class="badge-cc badge-closed"><i class="fa-solid fa-circle-xmark"></i> Out of stock</span>':p.stock<=5?`<span class="badge-cc badge-warn"><i class="fa-solid fa-triangle-exclamation"></i> Only ${p.stock} left</span>`:'<span class="badge-cc badge-open"><i class="fa-solid fa-circle-check"></i> In stock</span>';
      html(el,`<div class="row g-4"><div class="col-lg-6"><div class="gallery-main" id="gm">${CC.img('products',p.id,p.name)}</div><div class="gallery-thumbs">${['','-2','-3'].map((x,i)=>`<button type="button" data-g="${p.id+x}" aria-pressed="${i===0}" aria-label="View image ${i+1}">${CC.img('products',p.id+x,p.name+' view '+(i+1))}</button>`).join('')}</div></div>
      <div class="col-lg-6"><span class="badge-cc pill-local mb-2">${p.tag}</span><h1 class="h2">${esc(p.name)}</h1><div class="d-flex gap-3 align-items-center mb-2">${stars(p.rating)}<a href="#reviews" class="small">${p.reviews} ratings (sample)</a>${stockLbl}</div>
      <div class="price fs-3 mb-2">${inr(p.price)}${p.old?`<s>${inr(p.old)}</s> <span class="badge-cc badge-warn">${Math.round((p.old-p.price)*100/p.old)}% off</span>`:''}</div><p>${esc(p.desc)}</p>
      ${p.variant?`<div class="mb-3"><div class="form-label">${p.variant.label}: <strong id="vl">${variant}</strong></div><div class="d-flex flex-wrap gap-2" id="vopts">${p.variant.opts.map((o,i)=>`<button type="button" class="opt-btn" aria-pressed="${i===0}">${o}</button>`).join('')}</div></div>`:''}
      <div class="d-flex flex-wrap gap-2 align-items-center mb-3"><div class="qty" role="group" aria-label="Quantity"><button type="button" id="qd" aria-label="Decrease quantity">−</button><input id="qv" value="1" readonly aria-label="Quantity"><button type="button" id="qi" aria-label="Increase quantity">+</button></div>
      <button class="btn-cc btn-primary-cc" id="addc" ${p.stock?'':'disabled'}><i class="fa-solid fa-cart-plus"></i> Add to cart</button><button class="btn-cc btn-green-cc" id="buy" ${p.stock?'':'disabled'}>Buy now</button><button class="btn-icon wish" type="button" data-id="${p.id}" aria-pressed="false" aria-label="Save to wishlist"><i class="fa-regular fa-heart"></i></button></div>
      <div class="cc-card p-3 flex-row gap-3 align-items-center mb-3" style="height:auto"><img src="${root}assets/images/shops/${s.id}-logo.svg" alt="" width="56" height="56" class="rounded-circle"><div><div class="small text-muted-cc">Sold by</div><a href="shop-details.html?id=${s.id}" class="fw-semibold">${esc(s.name)}</a><div class="small text-muted-cc"><i class="fa-solid fa-location-dot"></i> ${s.area}, ${s.city} · ${stars(s.rating)}</div></div></div>
      <ul class="list-unstyled small mb-0"><li class="mb-1"><i class="fa-solid fa-truck-fast text-success"></i> Home delivery by the shop in 1–3 days within ${s.city} (charges shown at checkout)</li><li class="mb-1"><i class="fa-solid fa-store text-success"></i> Free store pickup from ${s.area}, usually ready within 2 hours</li><li><i class="fa-solid fa-rotate-left text-success"></i> Returns follow the <a href="refund-policy.html">return policy</a></li></ul></div></div>
      <ul class="nav nav-tabs mt-5" role="tablist"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#t-desc" type="button" role="tab">Description</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#t-spec" type="button" role="tab">Specifications</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#t-rev" type="button" role="tab" id="reviews">Reviews</button></li></ul>
      <div class="tab-content bg-white border border-top-0 rounded-bottom p-3"><div class="tab-pane fade show active" id="t-desc"><p>${esc(p.desc)}</p><p class="mb-0">Sold and fulfilled by <strong>${esc(s.name)}</strong>, ${s.area}. ${s.maker?'This shop makes or commissions its own products.':'This shop is an independent local retailer.'}</p></div>
      <div class="tab-pane fade" id="t-spec"><table class="table spec-table mb-0"><tbody>${p.specs.map(r=>`<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>
      <div class="tab-pane fade" id="t-rev"><p class="demo-note">Sample reviews for layout only. Not real customer feedback.</p>${D.reviews.slice(0,3).map(r=>`<div class="review-card mb-2"><div class="d-flex justify-content-between"><strong>${r.name}</strong>${stars(r.rating)}</div><p class="mb-0 small">${esc(r.text)}</p></div>`).join('')}</div></div>
      ${rel.length?`<h2 class="h4 mt-5">Related products</h2><div class="row g-3">${rel.map(x=>CC.pcard(x,'col-6 col-md-3')).join('')}</div>`:''}
      <h2 class="h4 mt-5">More from ${esc(s.name)}</h2><div class="row g-3">${more.map(x=>CC.pcard(x,'col-6 col-md-3')).join('')}</div>`);
      $('#bc-name').textContent=p.name;$('#bc-cat').textContent=p.cat;
      $$('[data-g]').forEach(b=>b.onclick=()=>{$('#gm').innerHTML=CC.img('products',b.dataset.g,p.name);$$('[data-g]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
      $$('#vopts .opt-btn').forEach(b=>b.onclick=()=>{variant=b.textContent;$('#vl').textContent=variant;$$('#vopts .opt-btn').forEach(x=>x.setAttribute('aria-pressed',x===b))});
      $('#qd').onclick=()=>{qty=Math.max(1,qty-1);$('#qv').value=qty};$('#qi').onclick=()=>{if(qty>=Math.min(20,p.stock)){CC.toast('Only '+p.stock+' in stock');return}qty++;$('#qv').value=qty};
      const add=()=>{const c=CC.cart(),it=c.find(i=>i.id===p.id&&(i.v||null)===variant);it?it.qty+=qty:c.push({id:p.id,qty,v:variant});store.set('cart',c);CC.updateCounts()};
      $('#addc').onclick=()=>{add();CC.toast('Added to cart (demo)')};$('#buy').onclick=()=>{add();location.href='cart.html'};CC.syncWish();
    }
  }

  // ---------- shop details ----------
  if(page==='shop-details'){
    const s=CC.shop(Q.get('id')||'bhavna-boutique'),el=$('#sd');
    if(!s)notFound(el,'Shop');else{
      document.title=s.name+' · CityCart';const ps=D.products.filter(p=>p.shop===s.id);
      const open=s.open?'<span class="badge-cc badge-open"><i class="fa-solid fa-circle-check"></i> Open now</span>':'<span class="badge-cc badge-closed"><i class="fa-regular fa-clock"></i> Closed now</span>';
      html(el,`<div class="container"><div class="shop-cover">${CC.img('shops',s.id+'-cover',s.name+' cover')}</div>
      <div class="shop-id"><img class="logo" src="${root}assets/images/shops/${s.id}-logo.svg" alt="${esc(s.name)} logo" width="84" height="84"><div class="flex-grow-1 pb-1"><div class="d-flex flex-wrap gap-2 align-items-center"><h1 class="h3 m-0">${esc(s.name)}</h1>${open}<span class="badge-cc pill-local">${s.maker?'Made Locally':'Independent Business'}</span></div><div class="small text-muted-cc mt-1">${s.spec} · <i class="fa-solid fa-location-dot"></i> ${s.area}, ${s.city} · ${stars(s.rating)} (${s.reviews} ratings, sample)</div></div>
      <div class="d-flex gap-2 pb-1"><button class="btn-cc btn-outline-cc btn-sm-cc" data-toast="Shop followed (demo)"><i class="fa-regular fa-bell"></i> Follow</button><a class="btn-cc btn-green-cc btn-sm-cc" href="#contact">Contact shop</a></div></div>
      <div class="row g-4 mt-1"><div class="col-lg-8"><ul class="nav nav-tabs" role="tablist"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#s-prod" type="button">Products (${ps.length})</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#s-about" type="button">About</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#s-rev" type="button">Reviews</button></li></ul>
      <div class="tab-content pt-3"><div class="tab-pane fade show active" id="s-prod"><div class="d-flex gap-2 flex-wrap mb-3" id="sChips"><button class="chip active" type="button" data-c="">All</button>${[...new Set(ps.map(p=>p.cat))].map(c=>`<button class="chip" type="button" data-c="${c}">${c}</button>`).join('')}<select class="form-select form-select-sm w-auto ms-auto" id="sSort" aria-label="Sort"><option value="">Recommended</option><option value="a">Price: low to high</option><option value="d">Price: high to low</option></select></div><div class="row g-3" id="sGrid"></div></div>
      <div class="tab-pane fade" id="s-about"><div class="cc-card p-3" style="height:auto"><p>${esc(s.desc)}</p><p class="mb-0 small text-muted-cc">Owner: ${esc(s.owner)} · Serving customers since ${s.since}</p></div></div>
      <div class="tab-pane fade" id="s-rev"><p class="demo-note">Sample reviews for layout only.</p>${D.reviews.slice(0,4).map(r=>`<div class="review-card mb-2"><div class="d-flex justify-content-between"><strong>${r.name}</strong>${stars(r.rating)}</div><p class="mb-0 small">${esc(r.text)}</p></div>`).join('')}</div></div></div>
      <aside class="col-lg-4"><div class="cc-card p-3 mb-3" style="height:auto" id="contact"><h2 class="h6">Store information</h2><ul class="list-unstyled small mb-0"><li class="mb-2"><i class="fa-regular fa-clock text-success"></i> ${s.hours}</li><li class="mb-2"><i class="fa-solid fa-location-dot text-success"></i> ${s.area}, ${s.city}</li><li class="mb-2"><i class="fa-solid fa-phone text-success"></i> ${s.phone} <span class="text-muted-cc">(placeholder)</span></li><li class="mb-2"><i class="fa-solid fa-truck-fast text-success"></i> Home delivery in ${s.city}; charges vary</li><li><i class="fa-solid fa-store text-success"></i> Free store pickup</li></ul></div>
      <div class="cc-card" style="height:auto"><div class="ratio ratio-4x3" style="background:linear-gradient(135deg,#E2EFE6,#EFE5D2)"><div class="d-grid place-items-center text-center p-3" style="place-items:center"><div><i class="fa-solid fa-map-location-dot fs-2 text-success"></i><p class="small mb-0 mt-2">Map placeholder<br>${s.area}, ${s.city}</p></div></div></div></div></aside></div></div>`);
      $('#bc-name').textContent=s.name;
      let cat='',sort='';const draw=()=>{let l=ps.filter(p=>!cat||p.cat===cat);if(sort==='a')l.sort((a,b)=>a.price-b.price);if(sort==='d')l.sort((a,b)=>b.price-a.price);$('#sGrid').innerHTML=l.map(p=>CC.pcard(p,'col-6 col-md-4')).join('');CC.syncWish()};
      $$('#sChips .chip').forEach(c=>c.onclick=()=>{cat=c.dataset.c;$$('#sChips .chip').forEach(x=>x.classList.toggle('active',x===c));draw()});$('#sSort').onchange=e=>{sort=e.target.value;draw()};draw();
    }
  }

  // ---------- search results ----------
  if(page==='search-results'){
    const q=(Q.get('q')||'').trim(),qi=$('#sq');qi.value=q;
    const words=q.toLowerCase().split(/\s+/).filter(Boolean);let sort='';
    const match=(...f)=>words.every(w=>f.join(' ').toLowerCase().includes(w));
    function run(){
      let ps=D.products.filter(p=>!words.length||match(p.name,p.cat,CC.shop(p.shop).name,p.desc)),ss=D.shops.filter(s=>!words.length||match(s.name,s.cat,s.spec,s.area)),cs=D.cats.filter(c=>words.length&&match(c.name));
      const mp=+$('#sp').value;ps=ps.filter(p=>p.price<=mp);$('#spl').textContent=inr(mp);
      if($('#sOpen').checked)ps=ps.filter(p=>CC.shop(p.shop).open);
      if(sort==='a')ps.sort((a,b)=>a.price-b.price);if(sort==='d')ps.sort((a,b)=>b.price-a.price);if(sort==='r')ps.sort((a,b)=>b.rating-a.rating);
      $('#qLabel').textContent=q?`Results for “${q}”`:'Browse everything';$('#cP').textContent=ps.length;$('#cS').textContent=ss.length;$('#cC').textContent=cs.length;
      html($('#rP'),ps.length?ps.map(p=>CC.pcard(p,'col-6 col-md-4 col-xl-3')).join(''):'');html($('#rS'),ss.map(s=>CC.scard(s,'col-12 col-md-6 col-xl-4')).join(''));
      html($('#rC'),cs.map(c=>`<div class="col-6 col-md-3"><a class="cat-tile" href="product-listing.html?cat=${encodeURIComponent(c.name)}"><span class="ico"><i class="fa-solid ${c.icon}"></i></span>${c.name}</a></div>`).join(''));
      $('#none').hidden=ps.length+ss.length+cs.length>0;CC.syncWish();
    }
    $('#sp').oninput=run;$('#sOpen').onchange=run;$('#sSortSel').onchange=e=>{sort=e.target.value;run()};run();
  }

  // ---------- wishlist ----------
  if(page==='wishlist'){
    const draw=()=>{const ids=store.get('wish',[]),ps=ids.map(CC.prod).filter(Boolean);
      html($('#wl'),ps.length?`<div class="row g-3">${ps.map(p=>CC.pcard(p,'col-6 col-md-4 col-lg-3')).join('')}</div>`:`<div class="empty-state"><i class="fa-regular fa-heart"></i><h2 class="h5 mt-2">Your wishlist is empty</h2><p class="text-muted-cc">Tap the heart on any product to save it here for later.</p><a class="btn-cc btn-primary-cc" href="product-listing.html">Browse products</a></div>`);
      $('#wlCount').textContent=ps.length;CC.syncWish()};
    document.addEventListener('wish-changed',draw);draw();
  }

  // ---------- cart ----------
  if(page==='cart'){
    const draw=()=>{const cart=CC.cart().filter(i=>CC.prod(i.id)),T=CC.totals(cart);
      $('#cartEmpty').hidden=cart.length>0;$('#cartFull').hidden=cart.length===0;if(!cart.length)return;
      html($('#cartGroups'),T.groups.map(g=>`<section class="cart-group"><header><span><i class="fa-solid fa-store"></i> ${esc(g.shop.name)}</span><span class="small fw-normal">${g.fee?inr(g.fee)+' delivery':g.mode==='pickup'?'Store pickup · free':'Free delivery (over '+inr(g.rule.free)+')'}</span></header>${g.rows.map(r=>`<div class="cart-item" data-id="${r.p.id}" data-v="${r.v||''}">${CC.img('products',r.p.id,r.p.name)}<div><h3 class="h6 mb-1" style="font-family:var(--cc-font)"><a class="stretch-none" href="product-details.html?id=${r.p.id}">${esc(r.p.name)}</a></h3><div class="small text-muted-cc mb-2">${inr(r.p.price)} each${r.v?' · '+esc(r.v):''}</div><div class="qty" role="group" aria-label="Quantity"><button type="button" data-dec aria-label="Decrease quantity">−</button><input type="text" value="${r.qty}" readonly aria-label="Quantity"><button type="button" data-inc aria-label="Increase quantity">+</button></div></div><div class="text-end d-flex flex-md-column justify-content-between align-items-end"><strong>${inr(r.line)}</strong><button class="btn btn-link text-danger p-0 small" type="button" data-remove><i class="fa-regular fa-trash-can"></i> Remove</button></div></div>`).join('')}</section>`).join(''));
      $('#sumSub').textContent=inr(T.sub);$('#sumDel').textContent=T.del?inr(T.del):'Free';$('#sumTotal').textContent=inr(T.total);$('#sumShops').textContent=T.groups.length;
      $('#shopNote').textContent=T.groups.length>1?`Your cart has items from ${T.groups.length} shops. Each shop packs and delivers separately, so timing and charges can differ.`:'Items are packed and delivered by one shop.';
    };
    const find=(c,el)=>{const row=el.closest('.cart-item');return c.find(i=>i.id===row.dataset.id&&(i.v||'')===row.dataset.v)};
    $('#cartGroups').addEventListener('click',e=>{const c=CC.cart();const b=e.target.closest('button');if(!b)return;const it=find(c,b);if(!it)return;
      if(b.hasAttribute('data-inc')){const p=CC.prod(it.id);if(it.qty>=Math.min(20,p.stock)){CC.toast('Only '+p.stock+' in stock');return}it.qty++}
      else if(b.hasAttribute('data-dec'))it.qty=Math.max(1,it.qty-1);
      else if(b.hasAttribute('data-remove')){c.splice(c.indexOf(it),1);CC.toast('Item removed')}else return;
      store.set('cart',c);CC.updateCounts();draw()});
    $('#clearCart').onclick=()=>CC.confirm('Remove all items from your cart?',()=>{store.set('cart',[]);CC.updateCounts();draw()},{ok:'Clear cart'});
    draw();
  }

  // ---------- checkout ----------
  if(page==='checkout'){
    const cart=CC.cart().filter(i=>CC.prod(i.id));if(!cart.length){location.replace('cart.html');return}
    const addrs=store.get('addresses',D.addresses);let fulfil=store.get('fulfil',{}),pay='upi';
    const paint=()=>{const T=CC.totals(cart,fulfil);
      html($('#ckAddr'),addrs.map((a,i)=>`<label class="opt-card mb-2"><input type="radio" name="addr" value="${a.id}" ${a.def_?'checked':''} class="mt-1"><span><strong>${a.label}</strong> · ${esc(a.name)}<br><span class="small text-muted-cc">${esc(a.line)}, ${a.area}, ${a.city} ${a.pin} · ${a.phone}</span></span></label>`).join('')+'<a class="small" href="add-address.html">+ Add a new address</a>');
      html($('#ckShops'),T.groups.map(g=>`<div class="cc-card p-3 mb-3" style="height:auto"><div class="d-flex justify-content-between flex-wrap gap-2 mb-2"><strong><i class="fa-solid fa-store text-success"></i> ${esc(g.shop.name)}</strong><span class="small text-muted-cc">${g.rows.length} item(s) · ${inr(g.sub)}</span></div><div class="row g-2"><div class="col-sm-6"><label class="opt-card"><input type="radio" name="f-${g.shop.id}" value="delivery" ${g.mode==='delivery'?'checked':''}><span><strong>Home delivery</strong><br><span class="small text-muted-cc">${g.sub>=g.rule.free?'Free':inr(g.rule.fee)} · 1–3 days</span></span></label></div><div class="col-sm-6"><label class="opt-card"><input type="radio" name="f-${g.shop.id}" value="pickup" ${g.mode==='pickup'?'checked':''}><span><strong>Store pickup</strong><br><span class="small text-muted-cc">Free · ${g.shop.area} · ready in ~2 h</span></span></label></div></div></div>`).join(''));
      html($('#ckReview'),T.groups.map(g=>`<div class="mb-2"><div class="small fw-semibold">${esc(g.shop.name)} <span class="fw-normal text-muted-cc">· ${g.mode==='pickup'?'Pickup':'Delivery'}</span></div>${g.rows.map(r=>`<div class="d-flex justify-content-between small"><span>${r.qty} × ${esc(r.p.name)}</span><span>${inr(r.line)}</span></div>`).join('')}</div>`).join(''));
      $('#sumSub').textContent=inr(T.sub);$('#sumDel').textContent=T.del?inr(T.del):'Free';$('#sumTotal').textContent=inr(T.total);
      $$('#ckShops input').forEach(r=>r.onchange=()=>{fulfil[r.name.slice(2)]=r.value;store.set('fulfil',fulfil);paint()});
    };paint();
    $$('[name=pay]').forEach(r=>r.onchange=()=>{pay=r.value;$('#payNote').hidden=pay!=='cod'});
    $('#placeOrder').onclick=()=>{
      const T=CC.totals(cart,fulfil),a=addrs.find(x=>x.id===($('[name=addr]:checked')||{}).value)||addrs[0];
      if(!a){CC.toast('Please add a delivery address');return}
      if(!$('#agree').checked){$('#agree').classList.add('is-invalid');$('#agree').focus();CC.toast('Please accept the terms to continue');return}
      const id='CC-'+(241000+Math.floor(Math.random()*900));const o={id,date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),status:'Processing',shop:T.groups[0].shop.id,shops:T.groups.map(g=>g.shop.id),items:cart.map(i=>({id:i.id,qty:i.qty})),payment:pay==='cod'?'Cash on delivery':pay==='upi'?'UPI · pending (demo)':'Card · pending (demo)',fulfil:T.groups.map(g=>g.mode==='pickup'?'Store pickup':'Home delivery').join(' / '),total:T.total,addr:a};
      const os=store.get('orders',[]);os.unshift(o);store.set('orders',os);store.set('cart',[]);store.del('fulfil');CC.updateCounts();
      location.href=`payment-status.html?o=${id}&s=${pay==='cod'?'success':'pending'}`};
  }

  // ---------- payment status (demo states) ----------
  if(page==='payment-status'){
    const o=Q.get('o')||'CC-DEMO',S={
      pending:{ic:'fa-hourglass-half',c:'warn',t:'Payment pending',d:'We are waiting for confirmation from the payment provider. In a live system this page would update automatically.',b:`<button class="btn-cc btn-outline-cc" data-s="success">Demo: show successful</button><button class="btn-cc btn-outline-cc" data-s="failed">Demo: show failed</button>`},
      success:{ic:'fa-circle-check',c:'ok',t:'Order placed (demo)',d:'This is a demonstration screen. No money has been charged and no real order was sent to a shop.',b:`<a class="btn-cc btn-primary-cc" href="order-confirmation.html?o=${o}">View order confirmation</a>`},
      failed:{ic:'fa-circle-xmark',c:'bad',t:'Payment failed',d:'In a live system you would see the reason from the payment provider. Your cart items are not lost. Try again or choose another method.',b:`<a class="btn-cc btn-primary-cc" href="checkout.html">Try again</a><a class="btn-cc btn-outline-cc" href="support.html">Contact support</a>`}};
    const draw=s=>{const x=S[s]||S.pending;html($('#ps'),`<div class="alert-card ${x.c} flex-column align-items-center text-center py-4"><i class="fa-solid ${x.ic} fs-1"></i><h1 class="h3 mt-2">${x.t}</h1><p class="mb-1">${x.d}</p><p class="small mb-3">Reference: <strong>${esc(o)}</strong></p><div class="d-flex gap-2 flex-wrap justify-content-center">${x.b}</div></div>`);$$('#ps [data-s]').forEach(b=>b.onclick=()=>{history.replaceState(null,'',`?o=${o}&s=${b.dataset.s}`);draw(b.dataset.s)});$$('#stateTabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s))};
    $$('#stateTabs button').forEach(b=>b.onclick=()=>{history.replaceState(null,'',`?o=${o}&s=${b.dataset.s}`);draw(b.dataset.s)});draw(Q.get('s')||'pending');
  }

  // ---------- orders ----------
  const allOrders=()=>[...store.get('orders',[]),...D.orders];
  const orderTotal=o=>o.total||o.items.reduce((n,i)=>n+CC.prod(i.id).price*i.qty,0)+(o.fulfil==='Store pickup'?0:40);
  if(page==='order-confirmation'){
    const os=allOrders(),o=os.find(x=>x.id===Q.get('o'))||os[0];
    const shops=[...new Set(o.items.map(i=>CC.prod(i.id).shop))];
    html($('#oc'),`<div class="text-center mb-4"><span class="badge-cc badge-open fs-6 mb-2"><i class="fa-solid fa-circle-check"></i> Order placed (demo)</span><h1 class="h2">Thank you, ${esc(store.get('user',D.user).name.split(' ')[0])}!</h1><p class="text-muted-cc mb-0">Order reference <strong>${o.id}</strong> · ${o.date}. This prototype does not send real orders to shops.</p></div>
    <div class="row g-4"><div class="col-lg-8">${shops.map(sid=>{const s=CC.shop(sid),its=o.items.filter(i=>CC.prod(i.id).shop===sid);return `<div class="cc-card mb-3" style="height:auto"><div class="p-3 border-bottom d-flex justify-content-between flex-wrap gap-2"><span class="mini-shop"><img src="${root}assets/images/shops/${s.id}-logo.svg" alt=""><span><strong>${esc(s.name)}</strong><br><small class="text-muted-cc">${s.area}, ${s.city}</small></span></span>${badge(o.status==='Delivered'?'Delivered':'Processing')}</div>${its.map(i=>{const p=CC.prod(i.id);return `<div class="d-flex gap-3 p-3 align-items-center border-bottom"><img class="thumb" style="width:60px;height:60px" src="${CC.src('products',p.id)}" alt="${esc(p.name)}"><div class="flex-grow-1"><div class="fw-medium">${esc(p.name)}</div><small class="text-muted-cc">Qty ${i.qty}</small></div><strong>${inr(p.price*i.qty)}</strong></div>`}).join('')}<div class="p-3 small text-muted-cc"><i class="fa-solid fa-truck-fast"></i> ${o.fulfil.includes('pickup')||o.fulfil==='Store pickup'?'Collect from the shop when it confirms your order is ready.':'The shop will deliver this part of your order directly.'}</div></div>`}).join('')}</div>
    <div class="col-lg-4"><div class="summary-box"><h2 class="h5">Summary</h2><dl><dt>Total</dt><dd class="fw-bold">${inr(orderTotal(o))}</dd><dt>Payment</dt><dd>${esc(o.payment)}</dd><dt>Fulfilment</dt><dd>${esc(o.fulfil)}</dd></dl>${o.addr?`<hr><p class="small mb-0"><strong>Deliver to</strong><br>${esc(o.addr.name)}, ${esc(o.addr.line)}, ${o.addr.area}, ${o.addr.city} ${o.addr.pin}</p>`:''}<div class="d-grid gap-2 mt-3"><a class="btn-cc btn-primary-cc" href="order-details.html?id=${o.id}">View order</a><a class="btn-cc btn-outline-cc" href="product-listing.html">Continue shopping</a></div></div></div></div>`);
  }
  if(page==='my-orders'){
    const os=allOrders();let tab='All';
    const grp=o=>({'Processing':'Active','Out for delivery':'Active','Delivered':'Delivered','Cancelled':'Cancelled'}[o.status]||'Active');
    const draw=()=>{const l=os.filter(o=>tab==='All'||(tab==='Processing'?o.status==='Processing':grp(o)===tab));
      html($('#ol'),l.length?l.map(o=>{const ps=o.items.map(i=>CC.prod(i.id)),s=CC.shop(ps[0].shop);return `<article class="cc-card mb-3" style="height:auto"><div class="p-3 d-flex flex-wrap gap-2 justify-content-between border-bottom"><div><strong>${o.id}</strong> <span class="text-muted-cc small">· ${o.date}</span><div class="small text-muted-cc">${esc(s.name)}${o.shops&&o.shops.length>1?' + '+(o.shops.length-1)+' more':''}</div></div><div class="text-end">${badge(o.status)}<div class="fw-bold mt-1">${inr(orderTotal(o))}</div></div></div><div class="p-3 d-flex gap-2 align-items-center flex-wrap">${ps.slice(0,4).map(p=>`<img class="thumb" style="width:52px;height:52px" src="${CC.src('products',p.id)}" alt="${esc(p.name)}">`).join('')}<span class="small text-muted-cc">${o.items.reduce((n,i)=>n+i.qty,0)} item(s)</span><a class="btn-cc btn-outline-cc btn-sm-cc ms-auto" href="order-details.html?id=${o.id}">View details</a></div></article>`}).join(''):`<div class="empty-state"><i class="fa-solid fa-box-open"></i><h2 class="h5 mt-2">No ${tab.toLowerCase()} orders</h2><p class="text-muted-cc">Orders you place will appear here.</p><a class="btn-cc btn-primary-cc" href="explore-shops.html">Explore local shops</a></div>`)};
    $$('#orderTabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;$$('#orderTabs button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b)});draw()});draw();
  }
  if(page==='order-details'){
    const o=allOrders().find(x=>x.id===Q.get('id'))||allOrders()[0];const T=['Order placed','Shop confirmed','Packed','Out for delivery','Delivered'];
    const idx={'Processing':1,'Out for delivery':3,'Delivered':4,'Cancelled':0}[o.status]??1;const shops=[...new Set(o.items.map(i=>CC.prod(i.id).shop))].map(CC.shop);const s=shops[0];
    const sub=o.items.reduce((n,i)=>n+CC.prod(i.id).price*i.qty,0);
    html($('#od'),`<div class="d-flex flex-wrap justify-content-between gap-2 mb-3"><div><h1 class="h3 mb-0">Order ${o.id}</h1><span class="text-muted-cc small">Placed ${o.date}</span></div><div>${badge(o.status)}</div></div>
    <div class="row g-4"><div class="col-lg-8"><div class="cc-card p-3 mb-3" style="height:auto"><h2 class="h6">Tracking</h2>${o.status==='Cancelled'?'<div class="alert-card bad"><i class="fa-solid fa-circle-xmark"></i><div>This order was cancelled. Refund details are shown as a demo state.</div></div>':`<ol class="timeline">${T.map((t,i)=>`<li class="${i<idx?'done':i===idx?'now':''}"><strong>${t}</strong><div class="small text-muted-cc">${i<=idx?(i<idx?'Completed':'In progress'):'Pending'}${i<=idx?' · '+o.date:''}</div></li>`).join('')}</ol>`}</div>
    <div class="cc-card mb-3" style="height:auto"><div class="p-3 border-bottom"><h2 class="h6 m-0">Items</h2></div>${o.items.map(i=>{const p=CC.prod(i.id);return `<div class="d-flex gap-3 p-3 align-items-center border-bottom"><img class="thumb" style="width:60px;height:60px" src="${CC.src('products',p.id)}" alt="${esc(p.name)}"><div class="flex-grow-1"><a class="fw-medium" href="product-details.html?id=${p.id}">${esc(p.name)}</a><div class="small text-muted-cc">Qty ${i.qty} · ${esc(CC.shop(p.shop).name)}</div></div><strong>${inr(p.price*i.qty)}</strong></div>`}).join('')}</div></div>
    <div class="col-lg-4"><div class="summary-box mb-3"><h2 class="h6">Payment & totals</h2><dl><dt>Items</dt><dd>${inr(sub)}</dd><dt>Delivery</dt><dd>${inr(Math.max(0,orderTotal(o)-sub))}</dd><dt class="border-top pt-2">Total</dt><dd class="border-top pt-2 fw-bold">${inr(orderTotal(o))}</dd><dt>Payment</dt><dd>${esc(o.payment)}</dd><dt>Fulfilment</dt><dd>${esc(o.fulfil)}</dd></dl></div>
    <div class="cc-card p-3 mb-3" style="height:auto"><h2 class="h6">Sold by</h2><div class="mini-shop"><img src="${root}assets/images/shops/${s.id}-logo.svg" alt=""><div><a href="shop-details.html?id=${s.id}" class="fw-semibold">${esc(s.name)}</a><div class="small text-muted-cc">${s.area}, ${s.city}</div></div></div></div>
    <div class="d-grid gap-2">${o.status==='Processing'?`<button class="btn-cc btn-outline-cc" id="cancelO"><i class="fa-solid fa-ban"></i> Cancel order</button>`:''}${o.status==='Delivered'?`<button class="btn-cc btn-outline-cc" data-toast="Return request form is a backend feature (demo)"><i class="fa-solid fa-rotate-left"></i> Request return</button><a class="btn-cc btn-outline-cc" href="reviews.html"><i class="fa-regular fa-star"></i> Write a review</a>`:''}<a class="btn-cc btn-primary-cc" href="support.html"><i class="fa-solid fa-headset"></i> Get help with this order</a></div></div></div>`);
    const cb=$('#cancelO');cb&&(cb.onclick=()=>CC.confirm('Cancel this order? The shop will be notified (demo only).',()=>{const os=store.get('orders',[]),f=os.find(x=>x.id===o.id);if(f){f.status='Cancelled';store.set('orders',os)}CC.toast('Order cancelled (demo)');setTimeout(()=>location.reload(),700)},{ok:'Cancel order',title:'Cancel order'}));
  }

  // ---------- account ----------
  const U=()=>store.get('user',D.user);
  if(page==='profile'){const u=U(),a=store.get('addresses',D.addresses);
    $('#pName').textContent=u.name;$('#pEmail').textContent=u.email;$('#pPhone').textContent='+91 '+u.phone;$('#pCity').textContent=u.city;$('#pSince').textContent=u.since;
    const d=store.get('avatarData',null);if(d)$('#pAvatar').src=d;
    const df=a.find(x=>x.def_)||a[0];if(df)$('#pAddr').innerHTML=`<strong>${df.label}</strong><br>${esc(df.line)}, ${df.area}, ${df.city} ${df.pin}`;
    $('#pOrders').textContent=allOrders().length;$('#pWish').textContent=store.get('wish',[]).length;
    $('#signOut').onclick=()=>{store.del('user');CC.toast('Signed out (demo)');setTimeout(()=>location.href='login.html',600)};
  }
  if(page==='edit-profile'){const u=U();['name','email','phone','city'].forEach(k=>$('#ep-'+k).value=u[k]);const d=store.get('avatarData',null);if(d)$('#ep-prev').innerHTML=`<img src="${d}" alt="Preview">`;
    $('#ep-file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#ep-prev').innerHTML=`<img src="${r.result}" alt="Preview">`;if(r.result.length<300000)store.set('avatarData',r.result)};r.readAsDataURL(f)});
    document.addEventListener('form-ok',()=>{store.set('user',{...u,name:$('#ep-name').value,email:$('#ep-email').value,phone:$('#ep-phone').value,city:$('#ep-city').value})});}
  if(page==='addresses'){
    const draw=()=>{const a=store.get('addresses',D.addresses);html($('#addrList'),a.length?a.map(x=>`<div class="col-md-6"><div class="addr-card ${x.def_?'default':''}"><div class="d-flex justify-content-between mb-2"><span class="badge-cc ${x.label==='Home'?'badge-open':'badge-info'}"><i class="fa-solid ${x.label==='Home'?'fa-house':'fa-briefcase'}"></i> ${esc(x.label)}</span>${x.def_?'<span class="badge-cc badge-open"><i class="fa-solid fa-check"></i> Default</span>':''}</div><strong>${esc(x.name)}</strong><p class="small mb-2">${esc(x.line)}, ${x.area}<br>${x.city}, ${x.state} ${x.pin}<br>Mobile: +91 ${x.phone}</p><div class="d-flex flex-wrap gap-2"><a class="btn-cc btn-outline-cc btn-sm-cc" href="add-address.html?id=${x.id}"><i class="fa-solid fa-pen"></i> Edit</a>${x.def_?'':`<button class="btn-cc btn-outline-cc btn-sm-cc" data-def="${x.id}">Make default</button>`}<button class="btn-cc btn-outline-cc btn-sm-cc text-danger" data-del="${x.id}"><i class="fa-regular fa-trash-can"></i> Delete</button></div></div></div>`).join(''):`<div class="col-12"><div class="empty-state"><i class="fa-solid fa-location-dot"></i><h2 class="h5 mt-2">No saved addresses</h2><p class="text-muted-cc">Add an address to check out faster.</p><a class="btn-cc btn-primary-cc" href="add-address.html">Add address</a></div></div>`)};
    $('#addrList').addEventListener('click',e=>{let a=store.get('addresses',D.addresses);const d=e.target.closest('[data-def]'),x=e.target.closest('[data-del]');
      if(d){a.forEach(i=>i.def_=i.id===d.dataset.def);store.set('addresses',a);CC.toast('Default address updated');draw()}
      if(x)CC.confirm('Delete this address?',()=>{a=a.filter(i=>i.id!==x.dataset.del);if(a.length&&!a.some(i=>i.def_))a[0].def_=true;store.set('addresses',a);CC.toast('Address deleted');draw()},{ok:'Delete'})});draw();
  }
  if(page==='add-address'){const id=Q.get('id'),a=store.get('addresses',D.addresses),ex=a.find(x=>x.id===id);
    if(ex){$('#adTitle').textContent='Edit address';$('#bc-name').textContent='Edit address';Object.entries({label:ex.label,name:ex.name,phone:ex.phone,line:ex.line,area:ex.area,city:ex.city,state:ex.state,pin:ex.pin}).forEach(([k,v])=>$('#ad-'+k).value=v)}
    document.addEventListener('form-ok',()=>{let l=store.get('addresses',D.addresses);const n={id:ex?ex.id:'a'+Date.now(),label:$('#ad-label').value,name:$('#ad-name').value,phone:$('#ad-phone').value,line:$('#ad-line').value,area:$('#ad-area').value,city:$('#ad-city').value,state:$('#ad-state').value,pin:$('#ad-pin').value,def_:ex?ex.def_:($('#ad-def').checked||!l.length)};
      if(n.def_)l.forEach(i=>i.def_=false);l=ex?l.map(i=>i.id===ex.id?n:i):[...l,n];store.set('addresses',l)});}
  if(page==='login'){document.addEventListener('form-ok',()=>store.set('user',D.user))}
  if(page==='reviews'){$$('[data-remove]').forEach(()=>{})}
  });
})();
