import{j as d}from"./index-CzIT3y9u.js";function f({name:r,size:o="md",className:n=""}){const s=t=>t.split(" ").map(e=>e[0]).join("").substring(0,2).toUpperCase(),a=()=>{switch(o){case"sm":return"w-8 h-8 text-xs";case"md":return"w-10 h-10 text-sm";case"lg":return"w-12 h-12 text-base";default:return"w-10 h-10 text-sm"}},i=t=>{const e=["from-blue-500 to-purple-600","from-green-500 to-teal-600","from-orange-500 to-red-600","from-purple-500 to-pink-600","from-indigo-500 to-blue-600","from-teal-500 to-cyan-600","from-red-500 to-pink-600","from-yellow-500 to-orange-600"],l=t.split("").reduce((m,u)=>m+u.charCodeAt(0),0);return e[l%e.length]};return d.jsxDEV("div",{className:`
        ${a()} 
        rounded-full 
        bg-gradient-to-br ${i(r)}
        flex items-center justify-center 
        text-white font-bold 
        border-2 border-white shadow-sm
        ${n}
      `,children:s(r)},void 0,!1,{fileName:"C:/Chatvendas_new/src/components/Avatar.tsx",lineNumber:45,columnNumber:5},this)}export{f as A};
