// Knowhere animated subject marks — lifted from the app's side-nav, self-contained.
(function(){
  var LOGO_PATHS = "<path d=\"M59.49,48.82c4.96-3.45,6.29-10.38,2.64-14.48-5.47-6.15-15.35-5.87-21.32-.12-1.68,1.62-3.05,4.46-3.19,6.88-.21,3.6,1.97,6.41,4.7,8.55-.46.54-2.19.87-2.93.33-4.49-3.25-6.03-9.39-3.33-14.4,4.16-7.72,14.05-10.52,22.34-7.35,5.46,2.08,9.43,7.55,8.1,13.37-1.89,8.29-11.25,12.84-19.73,11.65l-2.92-2.67c5.42,2.14,10.94,1.53,15.65-1.74\"/><path d=\"M56.78,47.85c-3.13,1.82-6.81,2.04-10.01.86-4.18-1.55-6.58-5.93-4.57-9.89,1.86-3.67,5.52-5.27,9.66-5.22,3.33.04,6.2,1.24,8.06,4.21,2.13,3.4.57,7.89-3.14,10.05M56.99,44.82c1.67-2.08,1.53-4.5-.19-6.38-2.65-2.89-7.87-2.76-10.64.06-1.15,1.17-1.72,2.42-1.65,4.02.04,1.05.89,2.51,2.05,3.39,3.08,2.36,7.94,2.02,10.44-1.1\"/><path d=\"M56.57,23.7c-10.71-2.15-22.41,2.67-25.19,13.17-.47,1.78-.27,4.41-.03,6.21.4,2.98,1.75,5.07,4.48,7.62-1.84.42-4.26-1.55-5.2-2.84-4.62-6.35-2.96-16.58,5.12-22.81,5.79-4.47,13.28-5.7,20.39-4.48,9.38,1.6,17.07,9.51,15.58,18.92-.1.67-1.54,3.14-2.43,3.88,2.75-10.53-4.32-18-12.73-19.69\"/><path d=\"M60.54,53.4c-2.51,2.32-9.07,3.65-11.03,2.96-.33-.12-1.55-.82-1.69-1.33,4.38.32,9.71-.84,13.5-3.34l-.78,1.72Z\"/><path d=\"M22.4,42.33c-.72-2.69-.79-7.18-.35-9.24,2.29-10.72,12.68-18.17,23.32-19.64,3.6-.5,7.66-.62,11.16.07,8.29,1.65,14.39,4.87,17.04,12.89,1.14,3.98.8,6.7.8,6.7-1.84-9.21-9.77-15.34-18.75-16.64-11.21-1.63-22.87,2.64-28.68,12.41-2.48,4.18-2.88,8.73-1.93,13.49.36,1.79.87,3.4,2.19,5.27,0,0-3.6-.79-4.81-5.29\"/><path d=\"M58.79,56.74c-1.78,1.64-6.42,2.58-7.8,2.09-.23-.08-1.1-.58-1.2-.94,3.1.22,6.87-.59,9.55-2.37l-.55,1.22Z\"/><path d=\"M20.12,43.15s-1.33-2.98-1.5-3.96c-2.83-16.4,12.77-29.05,28.42-30.03,7.2-.45,12.34.35,19.28,3.61-.77-1.71-2.2-4.01-4.14-4.79-5.57-2.26-12.96-2.5-18.76-1.61-9.93,1.53-18.78,6.83-24.12,15.21-3.04,4.78-4.67,10.3-3.49,15.74.58,2.67,1.72,4.31,4.32,5.83\"/><path d=\"M57.75,59.35c-1.34,1.24-4.84,1.95-5.88,1.58-.18-.06-.83-.44-.9-.71,2.34.17,5.18-.45,7.2-1.78l-.42.92Z\"/><path d=\"M9.92,33.59C8.26,15.62,21.9,3.36,38.62,0c0,0,5.88.51,7.47,1.81C30.51,3.44,15.58,12.45,12.59,28.46c-.77,4.12-.26,6.95.94,10.06,0,0-3.36-2.19-3.61-4.93\"/><path d=\"M56.89,61.7c-.98.9-3.52,1.42-4.28,1.15-.13-.05-.6-.32-.66-.52,1.7.12,3.77-.33,5.24-1.3l-.3.67Z\"/><path d=\"M6.69,31.56c-1.24-.83-2.32-2.79-2.28-3.96.16-4.49,1.02-8.27,2.91-12.42,2.63-5.78,4.68-8.23,9.76-12.07,1.54-1.16,6.13-3.3,8.1-2.45C13.79,7.18,6.93,18.32,6.69,31.56\"/><path d=\"M56.24,63.66c-.7.65-2.54,1.02-3.08.83-.09-.03-.43-.23-.47-.37,1.22.09,2.72-.23,3.77-.93l-.22.48Z\"/><path d=\"M2.04,27.6c-4.72-3.82-.63-18.2,6.04-20.12-3.34,5.02-6.98,14.16-6.04,20.12\"/><path d=\"M55.65,65.36c-.45.42-1.64.66-1.99.53-.06-.02-.28-.15-.3-.24.79.06,1.75-.15,2.44-.6l-.14.31Z\"/><path d=\"M54.27,41.9c0,1.37-1.32,2.48-2.94,2.48s-2.94-1.11-2.94-2.48,1.32-2.48,2.94-2.48,2.94,1.11,2.94,2.48\"/>";
  var SUBCOLORS = {"biology":"#5AADD4","chemistry":"#3E9AD6","physics":"#3A6FC8","psychology":"#6A60D4","foundation-maths":"#7ED97A","general-maths":"#4FC65A","maths-methods":"#2FA94E","specialist-maths":"#24803F","english":"#BB6FE2","modern-history":"#9A5FD2","geography":"#7870C0","economics":"#F187B6","business-management":"#E85D97","accounting":"#CE4480","health-hd":"#F0A04E","physical-ed":"#E86A32","visual-comm":"#E8C63F"};
  var _SUBCOLORS_OLD = {"z":"#166FB1"};
  function rgbOf(hex){ hex=hex.replace('#',''); if(hex.length===3)hex=hex.split('').map(function(c){return c+c;}).join(''); var n=parseInt(hex,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
  function rgba(c,a){ return 'rgba('+c.r+','+c.g+','+c.b+','+a+')'; }
  function glow(ctx,col,b){ ctx.shadowColor=col; ctx.shadowBlur=b; }

  function drawMark(id,ctx,w,h,t,c,I,e,mv){
    const cx=w/2, cy=h/2, s=Math.min(w,h), white={r:255,g:255,b:255};
    switch(id){
      case 'biology':{
        const N=10,R=s*0.18,H=s*0.6,top=cy-H/2,p1=[],p2=[];
        for(let i=0;i<N;i++){const f=i/(N-1),a=f*Math.PI*2.6+t*1.05,y=top+f*H;
          p1.push([cx+Math.cos(a)*R,y,Math.sin(a)]); p2.push([cx+Math.cos(a+Math.PI)*R,y,Math.sin(a+Math.PI)]);}
        for(let i=0;i<N;i++){const z=(p1[i][2]+1)/2; ctx.strokeStyle=rgba(c,(0.15+0.45*z)*(0.6+0.4*I)); ctx.lineWidth=1.1;
          ctx.beginPath();ctx.moveTo(p1[i][0],p1[i][1]);ctx.lineTo(p2[i][0],p2[i][1]);ctx.stroke();}
        glow(ctx,rgba(c,0.6),s*0.05*(0.4+I));
        for(const P of [p1,p2]){ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.6;ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
        ctx.shadowBlur=0;
        for(const P of [p1,p2])for(const p of P){const z=(p[2]+1)/2;glow(ctx,rgba(c,0.9),5*z*(0.4+I));ctx.fillStyle=z>0.62?rgba(white,0.92):rgba(c,0.55+0.3*z);ctx.beginPath();ctx.arc(p[0],p[1],1+1.8*z,0,7);ctx.fill();}
        ctx.shadowBlur=0; break;
      }
      case 'chemistry':{
        const nw=s*0.05,y0=cy-0.30*s,y1=cy-0.09*s,y2=cy+0.30*s,bw=s*0.22,ly=cy+0.04*s;
        if(!e.ready){ e.parts=Array.from({length:6},()=>({x:cx+(Math.random()-0.5)*bw*1.3,y:y2-Math.random()*(y2-ly),r:0.9+Math.random()*1.2,sp:18+Math.random()*22})); e.ready=true; }
        ctx.save();ctx.beginPath();ctx.moveTo(cx-nw,y1);ctx.lineTo(cx-bw,y2);ctx.lineTo(cx+bw,y2);ctx.lineTo(cx+nw,y1);ctx.closePath();ctx.clip();
        ctx.fillStyle=rgba(c,0.26+0.12*I);
        ctx.beginPath();ctx.moveTo(cx-bw,y2);ctx.lineTo(cx+bw,y2);ctx.lineTo(cx+bw,ly);
        for(let x=cx+bw;x>=cx-bw;x-=4){ctx.lineTo(x,ly+Math.sin(x*0.06+t*3)*2);} ctx.closePath();ctx.fill();
        for(const b of e.parts){ if(mv){b.y-=b.sp*(0.6+I)*0.016; if(b.y<ly-1){b.y=y2-3;b.x=cx+(Math.random()-0.5)*bw*1.3;}}
          glow(ctx,rgba(c,0.8),4);ctx.fillStyle=rgba(white,0.7);ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();}
        ctx.restore();ctx.shadowBlur=0;
        glow(ctx,rgba(c,0.5),s*0.04*(0.4+I));
        ctx.strokeStyle=rgba(c,0.9);ctx.lineWidth=1.6;
        ctx.beginPath();ctx.moveTo(cx-nw,y0);ctx.lineTo(cx-nw,y1);ctx.lineTo(cx-bw,y2);ctx.lineTo(cx+bw,y2);ctx.lineTo(cx+nw,y1);ctx.lineTo(cx+nw,y0);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-nw*1.6,y0);ctx.lineTo(cx+nw*1.6,y0);ctx.stroke();ctx.shadowBlur=0; break;
      }
      case 'physics':{
        const rx=s*0.31,ry=s*0.12;
        for(let k=0;k<3;k++){ ctx.save();ctx.translate(cx,cy);ctx.rotate(k*Math.PI/3);
          ctx.strokeStyle=rgba(c,0.45*(0.6+0.4*I));ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,7);ctx.stroke();
          const a=t*1.5+k*2.1,ex=Math.cos(a)*rx,ey=Math.sin(a)*ry;
          glow(ctx,rgba(c,0.9),6*(0.4+I));ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(ex,ey,2,0,7);ctx.fill();ctx.shadowBlur=0;ctx.restore();}
        glow(ctx,rgba(c,1),11*(0.5+I));ctx.fillStyle=rgba(c,0.95);ctx.beginPath();ctx.arc(cx,cy,s*0.05,0,7);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle=rgba(white,0.85);ctx.beginPath();ctx.arc(cx,cy,s*0.022,0,7);ctx.fill(); break;
      }
      case 'maths-methods':{
        const W=s*0.64,A=s*0.16,x0=cx-W/2,fx=(x)=>cy-Math.sin((x-x0)/W*Math.PI*2)*A;
        ctx.strokeStyle=rgba(c,0.18);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+W,cy);ctx.stroke();
        const xp=x0+W*(Math.sin(t*0.5)*0.5+0.5);
        ctx.fillStyle=rgba(c,0.15+0.1*I);ctx.beginPath();ctx.moveTo(x0,cy);for(let x=x0;x<=xp;x+=3)ctx.lineTo(x,fx(x));ctx.lineTo(xp,cy);ctx.closePath();ctx.fill();
        glow(ctx,rgba(c,0.6),s*0.045*(0.4+I));ctx.strokeStyle=rgba(c,0.9);ctx.lineWidth=1.7;ctx.beginPath();
        for(let x=x0;x<=x0+W;x+=2){const y=fx(x);x===x0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.shadowBlur=0;
        glow(ctx,rgba(c,0.9),7);ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(xp,fx(xp),2.4,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'specialist-maths':{
        const R=s*0.27,a=t*1.15,ex=cx+Math.cos(a)*R,ey=cy-Math.sin(a)*R;
        ctx.strokeStyle=rgba(c,0.4);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx,cy,R,R,0,0,7);ctx.stroke();
        if(mv){e.trail.unshift([ex,ey]); if(e.trail.length>14)e.trail.pop();}
        e.trail.forEach((p,i)=>{const al=(1-i/14)*0.5;glow(ctx,rgba(c,al),4);ctx.fillStyle=rgba(c,al);ctx.beginPath();ctx.arc(p[0],p[1],1.6,0,7);ctx.fill();});ctx.shadowBlur=0;
        glow(ctx,rgba(c,0.6),s*0.04*(0.4+I));ctx.strokeStyle=rgba(c,0.9);ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();ctx.shadowBlur=0;
        glow(ctx,rgba(c,0.9),7);ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(ex,ey,2.4,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'english':{
        const pw=s*0.27,ph=s*0.34,spineTop=cy-ph*0.36,spineBot=cy+ph*0.5;
        const L=[[cx,spineTop],[cx-pw,cy-ph*0.5],[cx-pw,cy+ph*0.34],[cx,spineBot]];
        const Rg=[[cx,spineTop],[cx+pw,cy-ph*0.5],[cx+pw,cy+ph*0.34],[cx,spineBot]];
        const quad=(q,al,lw)=>{ctx.strokeStyle=rgba(c,al);ctx.lineWidth=lw;ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.stroke();};
        glow(ctx,rgba(c,0.4),s*0.035*(0.4+I));quad(L,0.85,1.5);quad(Rg,0.85,1.5);ctx.shadowBlur=0;
        const ang=(Math.sin(t*0.8)*0.5+0.5),px=cx+Math.cos(Math.PI*ang)*pw;
        ctx.globalAlpha=0.55;quad([[cx,spineTop],[px,cy-ph*0.46],[px,cy+ph*0.3],[cx,spineBot]],0.8,1.3);ctx.globalAlpha=1;
        glow(ctx,rgba(c,0.9),7*(0.4+I));ctx.fillStyle=rgba(white,0.92);ctx.beginPath();ctx.arc(cx,spineTop,2.2,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'modern-history':{
        const tiers=4,baseW=s*0.27,dW=s*0.052,dh=s*0.07,gap=s*0.085,cycle=(t*0.4)%(tiers+1.6);let topY=cy;
        for(let k=0;k<tiers;k++){ const rx=baseW-k*dW,ry=rx*0.5,settle=Math.max(0,Math.min(1,cycle-k));
          const baseY=cy+s*0.15-k*gap,yy=baseY+(1-settle)*(-s*0.26),al=0.35+0.55*settle;
          ctx.fillStyle=rgba(c,0.12*al);ctx.strokeStyle=rgba(c,0.8*al);ctx.lineWidth=1.2;
          ctx.beginPath();ctx.moveTo(cx-rx,yy);ctx.lineTo(cx,yy+ry);ctx.lineTo(cx,yy+ry+dh);ctx.lineTo(cx-rx,yy+dh);ctx.closePath();ctx.fill();ctx.stroke();
          ctx.fillStyle=rgba(c,0.18*al);ctx.beginPath();ctx.moveTo(cx+rx,yy);ctx.lineTo(cx,yy+ry);ctx.lineTo(cx,yy+ry+dh);ctx.lineTo(cx+rx,yy+dh);ctx.closePath();ctx.fill();ctx.stroke();
          glow(ctx,rgba(c,0.5*al),s*0.03*(0.4+I));ctx.beginPath();ctx.moveTo(cx,yy-ry);ctx.lineTo(cx+rx,yy);ctx.lineTo(cx,yy+ry);ctx.lineTo(cx-rx,yy);ctx.closePath();
          ctx.fillStyle=rgba(c,0.22*al);ctx.fill();ctx.strokeStyle=rgba(c,0.9*al);ctx.lineWidth=1.4;ctx.stroke();ctx.shadowBlur=0;
          if(k===tiers-1) topY=yy-ry;}
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.92);ctx.beginPath();ctx.arc(cx,topY-s*0.04,2.2,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'geography':{
        const rings=5;
        for(let k=rings;k>=1;k--){ const baseR=s*0.066*k;ctx.strokeStyle=rgba(c,0.22+0.13*(rings-k)/rings);ctx.lineWidth=1.2;ctx.beginPath();
          for(let a=0;a<=Math.PI*2+0.1;a+=0.25){const rr=baseR+Math.sin(a*3+k*0.8+t*0.3)*s*0.014*0.5*k*0.4,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*0.62;a===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
          ctx.closePath();ctx.stroke();}
        const a=t*0.9,len=s*0.066*rings;
        glow(ctx,rgba(c,0.7),s*0.04*(0.4+I));ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len*0.62);ctx.stroke();ctx.shadowBlur=0;
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(cx,cy,2.2,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'psychology':{
        const nd=[[cx-s*0.27,cy-s*0.17],[cx-s*0.28,cy+s*0.10],[cx-s*0.02,cy-s*0.25],[cx,cy+s*0.02],[cx-s*0.05,cy+s*0.24],[cx+s*0.26,cy-s*0.09],[cx+s*0.27,cy+s*0.16]];
        const ed=[[0,2],[0,3],[1,3],[1,4],[2,3],[3,4],[2,5],[3,5],[3,6],[4,6]];
        ctx.lineWidth=1.2;
        ed.forEach(function(pr){var a=nd[pr[0]],b=nd[pr[1]];ctx.strokeStyle=rgba(c,0.22*(0.7+0.3*I));ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();});
        ed.forEach(function(pr,i){var a=nd[pr[0]],b=nd[pr[1]];var p=(t*0.6+i*0.37)%1;var px=a[0]+(b[0]-a[0])*p,py=a[1]+(b[1]-a[1])*p;glow(ctx,rgba(c,0.9),6*(0.4+I));ctx.fillStyle=rgba(white,0.85);ctx.beginPath();ctx.arc(px,py,1.7,0,7);ctx.fill();});ctx.shadowBlur=0;
        nd.forEach(function(n,i){var pulse=0.5+0.5*Math.sin(t*1.6+i);var r=s*0.018+s*0.006*pulse;glow(ctx,rgba(c,0.85),9*(0.4+I));var core=i%3===0;ctx.fillStyle=core?rgba(white,0.92):rgba(c,0.6+0.3*pulse);ctx.beginPath();ctx.arc(n[0],n[1],r,0,7);ctx.fill();});ctx.shadowBlur=0; break;
      }
      case 'foundation-maths':{
        const bw=s*0.5,x0=cx-bw/2,rows=3;
        ctx.strokeStyle=rgba(c,0.35);ctx.lineWidth=1.4;
        ctx.strokeRect(x0-s*0.03,cy-s*0.26,bw+s*0.06,s*0.52);
        for(let r=0;r<rows;r++){
          const y=cy-s*0.17+r*s*0.17;
          ctx.strokeStyle=rgba(c,0.26);ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+bw,y);ctx.stroke();
          const beads=5,br=s*0.03,gap2=br*2.15;
          const shift=0.5+0.5*Math.sin(t*0.7+r*1.1);
          const split=1+Math.round(shift*3);
          for(let k=0;k<beads;k++){
            let bx;
            if(k<beads-split){ bx=x0+br+k*gap2; }
            else { const j=k-(beads-split); bx=x0+bw-br-(split-1-j)*gap2; }
            const on=k>=beads-split;
            glow(ctx,rgba(c,on?0.8:0.25),on?7*(0.4+I):3);
            ctx.fillStyle=on?rgba(c,0.9):rgba(c,0.4);
            ctx.beginPath();ctx.arc(bx,y,br,0,7);ctx.fill();ctx.shadowBlur=0;
            if(on){ctx.fillStyle=rgba(white,0.5);ctx.beginPath();ctx.arc(bx-br*0.3,y-br*0.3,br*0.28,0,7);ctx.fill();}
          }
        } break;
      }
      case 'general-maths':{
        const n=5,baseY=cy+s*0.2,x0=cx-s*0.26,bw=s*0.07,gap2=s*0.045,H=s*0.34;
        ctx.strokeStyle=rgba(c,0.2);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0-s*0.02,baseY);ctx.lineTo(x0+(n-1)*(bw+gap2)+bw+s*0.02,baseY);ctx.stroke();
        let peak=[0,1e9];
        for(let i=0;i<n;i++){
          const bx=x0+i*(bw+gap2);
          const hh=H*(0.28+0.62*(0.5+0.5*Math.sin(t*1.1+i*0.8)));
          const top=baseY-hh;
          ctx.fillStyle=rgba(c,0.2+0.1*I);ctx.fillRect(bx,top,bw,hh);
          glow(ctx,rgba(c,0.5),s*0.02*(0.4+I));
          ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.3;ctx.strokeRect(bx,top,bw,hh);ctx.shadowBlur=0;
          if(top<peak[1])peak=[bx+bw/2,top];
        }
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.92);ctx.beginPath();ctx.arc(peak[0],peak[1],2.2,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'economics':{
        const W=s*0.56,H=s*0.42,x0=cx-W/2,yb=cy+H/2,yt=cy-H/2;
        ctx.strokeStyle=rgba(c,0.2);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x0,yt);ctx.lineTo(x0,yb);ctx.lineTo(x0+W,yb);ctx.stroke();
        const sh=Math.sin(t*0.55)*s*0.04;
        glow(ctx,rgba(c,0.4),s*0.02*(0.4+I));
        ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.7;
        ctx.beginPath();ctx.moveTo(x0,yt+H*0.12);ctx.quadraticCurveTo(cx,cy,x0+W,yb-H*0.12);ctx.stroke();
        ctx.strokeStyle=rgba(c,0.55);
        ctx.beginPath();ctx.moveTo(x0,yb-H*0.10+sh);ctx.quadraticCurveTo(cx,cy+sh,x0+W,yt+H*0.10+sh);ctx.stroke();ctx.shadowBlur=0;
        const ix=cx, iy=cy+sh*0.5;
        ctx.setLineDash([3,3]);ctx.strokeStyle=rgba(c,0.3);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix,yb);ctx.moveTo(ix,iy);ctx.lineTo(x0,iy);ctx.stroke();ctx.setLineDash([]);
        const pulse=0.5+0.5*Math.sin(t*2.4);
        glow(ctx,rgba(c,0.9),(7+3*pulse)*(0.5+I));ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(ix,iy,2.3+pulse*0.8,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'business-management':{
        const gear=function(gx,gy,R,teeth,rot,alpha){
          ctx.save();ctx.translate(gx,gy);ctx.rotate(rot);
          glow(ctx,rgba(c,0.4),s*0.02*(0.4+I));
          ctx.strokeStyle=rgba(c,alpha);ctx.lineWidth=1.7;
          ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();
          for(let k=0;k<teeth;k++){const a=k/teeth*Math.PI*2;const x1=Math.cos(a)*R,y1=Math.sin(a)*R,x2=Math.cos(a)*(R+s*0.03),y2=Math.sin(a)*(R+s*0.03);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
          ctx.shadowBlur=0;
          ctx.strokeStyle=rgba(c,alpha*0.7);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R*0.4,0,7);ctx.stroke();
          ctx.restore();
        };
        const rot=t*0.7;
        gear(cx-s*0.12,cy-s*0.05,s*0.15,9,rot,0.85);
        gear(cx+s*0.14,cy+s*0.10,s*0.11,7,-rot*1.28+0.3,0.6);
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.9);ctx.beginPath();ctx.arc(cx-s*0.12,cy-s*0.05,s*0.02,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'accounting':{
        const pivotY=cy-s*0.16, baseY=cy+s*0.26, bl=s*0.26;
        ctx.strokeStyle=rgba(c,0.55);ctx.lineWidth=1.7;
        ctx.beginPath();ctx.moveTo(cx,pivotY);ctx.lineTo(cx,baseY);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-s*0.11,baseY);ctx.lineTo(cx+s*0.11,baseY);ctx.stroke();
        const ang=Math.sin(t*0.8)*0.16;
        const lx=cx-Math.cos(ang)*bl, ly=pivotY-Math.sin(ang)*bl;
        const rx=cx+Math.cos(ang)*bl, ry=pivotY+Math.sin(ang)*bl;
        glow(ctx,rgba(c,0.5),s*0.02*(0.4+I));
        ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(rx,ry);ctx.stroke();ctx.shadowBlur=0;
        const pan=function(ex,ey){const drop=s*0.09,py=ey+drop;
          ctx.strokeStyle=rgba(c,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-s*0.05,py);ctx.moveTo(ex,ey);ctx.lineTo(ex+s*0.05,py);ctx.stroke();
          ctx.strokeStyle=rgba(c,0.8);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(ex,py,s*0.05,0,Math.PI);ctx.stroke();};
        pan(lx,ly);pan(rx,ry);
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.92);ctx.beginPath();ctx.arc(cx,pivotY,2.3,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'health-hd':{
        const W=s*0.72,x0=cx-W/2,A=s*0.2,period=W/2;
        const beat=function(f){f=((f%1)+1)%1;var y=0;
          y+=Math.exp(-Math.pow((f-0.30)/0.03,2))*0.18;
          y-=Math.exp(-Math.pow((f-0.45)/0.012,2))*0.22;
          y+=Math.exp(-Math.pow((f-0.50)/0.014,2))*1.0;
          y-=Math.exp(-Math.pow((f-0.55)/0.016,2))*0.34;
          y+=Math.exp(-Math.pow((f-0.70)/0.035,2))*0.3;
          return y;};
        const ph=t*0.5;
        ctx.strokeStyle=rgba(c,0.14);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+W,cy);ctx.stroke();
        glow(ctx,rgba(c,0.5),s*0.03*(0.4+I));
        ctx.strokeStyle=rgba(c,0.85);ctx.lineWidth=1.7;ctx.beginPath();
        for(let x=x0;x<=x0+W;x+=2){const f=(x-x0)/period+ph;const y=cy-beat(f)*A;x===x0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
        ctx.stroke();ctx.shadowBlur=0;
        const fx2=x0+W, ff=(fx2-x0)/period+ph, dy=cy-beat(ff)*A;
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(fx2,dy,2.4,0,7);ctx.fill();ctx.shadowBlur=0; break;
      }
      case 'physical-ed':{
        const W=s*0.6,x0=cx-W/2,ground=cy+s*0.24,bounceH=s*0.34,arcs=3;
        ctx.strokeStyle=rgba(c,0.18);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0-s*0.03,ground);ctx.lineTo(x0+W+s*0.03,ground);ctx.stroke();
        ctx.strokeStyle=rgba(c,0.2);ctx.lineWidth=1.3;ctx.beginPath();
        for(let i=0;i<=60;i++){const pp=i/60,xx=x0+pp*W,hh=Math.abs(Math.sin(pp*Math.PI*arcs))*bounceH*(1-pp*0.12);i?ctx.lineTo(xx,ground-hh-s*0.04):ctx.moveTo(xx,ground-hh-s*0.04);}
        ctx.stroke();
        const p=(t*0.5)%1,bx=x0+p*W,bh=Math.abs(Math.sin(p*Math.PI*arcs))*bounceH*(1-p*0.12),by=ground-bh-s*0.04;
        if(mv){e.trail.unshift([bx,by]);if(e.trail.length>14)e.trail.pop();}
        e.trail.forEach(function(pt,i){var al=(1-i/14)*0.4;glow(ctx,rgba(c,al),4);ctx.fillStyle=rgba(c,al);ctx.beginPath();ctx.arc(pt[0],pt[1],1.7,0,7);ctx.fill();});ctx.shadowBlur=0;
        const br=s*0.045;
        glow(ctx,rgba(c,0.8),10*(0.5+I));ctx.fillStyle=rgba(c,0.9);ctx.beginPath();ctx.arc(bx,by,br,0,7);ctx.fill();ctx.shadowBlur=0;
        ctx.strokeStyle=rgba(white,0.55);ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(bx,by,br*0.62,0.5,2.3);ctx.stroke();
        ctx.fillStyle=rgba(white,0.85);ctx.beginPath();ctx.arc(bx-br*0.3,by-br*0.3,br*0.22,0,7);ctx.fill(); break;
      }
      case 'visual-comm':{
        const P0=[cx-s*0.28,cy+s*0.14],P3=[cx+s*0.28,cy-s*0.10];
        const P1=[cx-s*0.06,cy-s*0.22+Math.sin(t*0.9)*s*0.05];
        const P2=[cx+s*0.10,cy+s*0.24+Math.cos(t*0.8)*s*0.05];
        ctx.setLineDash([4,4]);ctx.strokeStyle=rgba(c,0.35);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(P0[0],P0[1]);ctx.lineTo(P1[0],P1[1]);ctx.moveTo(P3[0],P3[1]);ctx.lineTo(P2[0],P2[1]);ctx.stroke();ctx.setLineDash([]);
        glow(ctx,rgba(c,0.55),s*0.03*(0.4+I));
        ctx.strokeStyle=rgba(c,0.9);ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(P0[0],P0[1]);ctx.bezierCurveTo(P1[0],P1[1],P2[0],P2[1],P3[0],P3[1]);ctx.stroke();ctx.shadowBlur=0;
        const tt=(t*0.35)%1,mt2=1-tt;
        const bez=function(a,b,cc,d){return mt2*mt2*mt2*a+3*mt2*mt2*tt*b+3*mt2*tt*tt*cc+tt*tt*tt*d;};
        const dx2=bez(P0[0],P1[0],P2[0],P3[0]),dyy=bez(P0[1],P1[1],P2[1],P3[1]);
        glow(ctx,rgba(c,0.9),8*(0.5+I));ctx.fillStyle=rgba(white,0.95);ctx.beginPath();ctx.arc(dx2,dyy,2.2,0,7);ctx.fill();ctx.shadowBlur=0;
        [P1,P2].forEach(function(p){ctx.strokeStyle=rgba(c,0.8);ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p[0],p[1],s*0.02,0,7);ctx.stroke();});
        [P0,P3].forEach(function(p){var r=s*0.022;glow(ctx,rgba(c,0.7),5*(0.4+I));ctx.fillStyle=rgba(c,0.9);ctx.fillRect(p[0]-r,p[1]-r,r*2,r*2);ctx.shadowBlur=0;ctx.fillStyle=rgba(white,0.85);ctx.fillRect(p[0]-r*0.4,p[1]-r*0.4,r*0.8,r*0.8);}); break;
      }
    }
  }

  function logoSvg(h, color){
    var w = h*74.42/65.92;
    return '<svg viewBox="0 0 74.42 65.92" height="'+h+'" width="'+w+'" fill="'+(color||'currentColor')+'" style="display:block">'+LOGO_PATHS+'</svg>';
  }

  // Mount an animation loop over every canvas[data-mark] inside rootEl (default document).
  // Each canvas: data-mark="unique-key" data-id="subjectId" [data-live="1" to force full animation].
  function mount(rootEl){
    var root = rootEl || document;
    var cache = {};
    var dpr = Math.min(window.devicePixelRatio||1, 2);
    var t0 = performance.now();
    var raf;
    function frame(now){
      var liveT = (now - t0)/1000;
      var cs = root.querySelectorAll('canvas[data-mark]');
      for (var i=0;i<cs.length;i++){
        var cv = cs[i];
        var key = cv.getAttribute('data-mark'), id = cv.getAttribute('data-id');
        var live = cv.getAttribute('data-live')==='1';
        var e = cache[key];
        if(!e || e.cv!==cv){ e={cv:cv,ctx:cv.getContext('2d'),parts:[],trail:[],ready:false,fz:(key.length%7)*1.3}; cache[key]=e; }
        var rect = cv.getBoundingClientRect();
        if(!rect.width){ continue; }
        if(Math.abs(rect.width-(e.w||0))>0.5 || Math.abs(rect.height-(e.h||0))>0.5){
          e.w=rect.width; e.h=rect.height; cv.width=Math.round(rect.width*dpr); cv.height=Math.round(rect.height*dpr); e.ready=false;
        }
        var mv = live;
        var t = live ? liveT : e.fz;
        var I = live ? 0.95 : 0.55;
        var ctx = e.ctx; ctx.setTransform(dpr,0,0,dpr,0,0);
        ctx.clearRect(0,0,e.w,e.h); ctx.lineCap='round'; ctx.lineJoin='round';
        drawMark(id, ctx, e.w, e.h, t, rgbOf(SUBCOLORS[id]||'#888'), I, e, mv);
        ctx.shadowBlur=0;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); };
  }

  // the five handles (Cat, 4 Sep 2026) — read by the footer nav and the mobile menu.
  // Glyphs: vendor/social/*.svg (Font Awesome Free brands, CC BY 4.0), coloured by CSS mask.
  var SOCIAL = [
    ['Instagram', 'https://www.instagram.com/knowheregoat/', 'instagram'],
    ['TikTok', 'https://www.tiktok.com/@knowhere.me', 'tiktok'],
    ['YouTube', 'https://www.youtube.com/@knowhere-me', 'youtube'],
    ['Facebook', 'https://www.facebook.com/profile.php?id=61594042136502', 'facebook-f'],
    ['LinkedIn', 'https://www.linkedin.com/company/knowhere-me/', 'linkedin-in']
  ];
  function socialHtml(cls){
    return SOCIAL.map(function(h){
      return '<a class="'+cls+'" href="'+h[1]+'" target="_blank" rel="noopener" aria-label="knowhere on '+h[0]+'" title="'+h[0]+'">'+
        '<i style="--ico:url(vendor/social/'+h[2]+'.svg)" aria-hidden="true"></i></a>';
    }).join('');
  }
  window.KnowhereMarks = { logoSvg: logoSvg, mount: mount, colors: SUBCOLORS, social: SOCIAL, socialHtml: socialHtml };
})();
