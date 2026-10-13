export function payload(type,d={}){
 const text=(key,max=2000)=>{const v=String(d[key]||'').trim();if(!v||v.length>max)throw Error(`Invalid ${key}`);return v;};
 const phone=()=>{const v=text('phone',20).replace(/[\s()-]/g,'');if(!/^\+?\d{7,15}$/.test(v))throw Error('Use a phone number with country code');return v;};
 if(type==='link'){const u=new URL(text('url'));if(!['http:','https:'].includes(u.protocol))throw Error('Use an HTTP or HTTPS link');return u.href;}
 if(type==='whatsapp')return `https://wa.me/${phone().replace('+','')}?text=${encodeURIComponent(String(d.message||'').slice(0,2000))}`;
 if(type==='phone')return `tel:${phone()}`;
 if(type==='email'){const e=text('email',254);if(!/^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(e))throw Error('Invalid email');return `mailto:${e}?subject=${encodeURIComponent(d.subject||'')}&body=${encodeURIComponent(d.message||'')}`;}
 if(type==='upi'){const id=text('upi',100);if(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(id))throw Error('Invalid UPI ID');const p=new URLSearchParams({pa:id,pn:text('payee',100),cu:'INR'});if(d.amount){if(!/^\d{1,7}(\.\d{1,2})?$/.test(String(d.amount))||Number(d.amount)<=0)throw Error('Invalid amount');p.set('am',d.amount);}if(d.message)p.set('tn',String(d.message).slice(0,100));return `upi://pay?${p}`;}
 if(type==='secret')return text('message',10000);
 throw Error('Unsupported QR type');
}
export function safeStyle(s={}){
 const c=/^#[0-9a-f]{6}$/i.test(s.color||'')?s.color:'#172e27';
 const rgb=c.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 if((1.05/(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]+.05))<4.5)throw Error('Choose a darker QR colour for reliable scanning');
 const logo=String(s.logo||'');if(logo && (logo.length>150000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logo)))throw Error('Invalid logo');
 return {logo,color:c,dots:['square','dots','rounded','classy','classy-rounded','extra-rounded'].includes(s.dots)?s.dots:'rounded',caption:String(s.caption||'').slice(0,120)};
}
