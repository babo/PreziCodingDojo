Elm = {}; Elm.Native = {}; Elm.Native.Graphics = {};
Elm.Graphics = {}; ElmRuntime = {}; ElmRuntime.Render = {}

Elm.Native.Char = function(elm) {
 'use strict';

 elm.Native = elm.Native || {};
 if (elm.Native.Char) return elm.Native.Char;

 function isBetween(lo,hi) { return function(chr) {
	 var c = chr.charCodeAt(0);
	 return lo <= c && c <= hi;
     };
 }
 var isDigit = isBetween('0'.charCodeAt(0),'9'.charCodeAt(0));
 var chk1 = isBetween('a'.charCodeAt(0),'f'.charCodeAt(0));
 var chk2 = isBetween('A'.charCodeAt(0),'F'.charCodeAt(0));

 return elm.Native.Char = {
     fromCode : function(c) { return String.fromCharCode(c); },
     toCode   : function(c) { return c.charCodeAt(0); },
     toUpper  : function(c) { return c.toUpperCase(); },
     toLower  : function(c) { return c.toLowerCase(); },
     toLocaleUpper : function(c) { return c.toLocaleUpperCase(); },
     toLocaleLower : function(c) { return c.toLocaleLowerCase(); },
     isLower    : isBetween('a'.charCodeAt(0),'z'.charCodeAt(0)),
     isUpper    : isBetween('A'.charCodeAt(0),'Z'.charCodeAt(0)),
     isDigit    : isDigit,
     isOctDigit : isBetween('0'.charCodeAt(0),'7'.charCodeAt(0)),
     isHexDigit : function(c) { return isDigit(c) || chk1(c) || chk2(c); }
 };

};


Elm.Native.Color = function(elm) {
 "use strict";

 elm.Native = elm.Native || {};
 if (elm.Native.Color) return elm.Native.Color;

 var Utils = Elm.Native.Utils(elm);

 function complement(rgb) {
     var hsv = toHSV(rgb);
     hsv.hue = (hsv.hue + 180) % 360;
     return toRGB(hsv);
 }

 function hsva(h,s,v,a) {
     var degree = A2(Utils.mod, h * 180 / Math.PI, 360);
     var clr = toRGB({hue:degree, saturation:s, value:v});
     clr._3 = a;
     return clr;
 }

 function hsv(h,s,v) {
     var degree = A2(Utils.mod, h * 180 / Math.PI, 360);
     return toRGB({hue:degree, saturation:s, value:v});
 }

 function toHSV(rgb) {
  var hsv = {};
  var r = rgb._0 / 255.0, g = rgb._1 / 255.0, b = rgb._2 / 255.0;
  var M = Math.max(r,g,b);
  var m = Math.min(r,g,b);
  var c = M - m;

  var h = 0;
       if (c === 0) { h = 0; }
  else if (M === r) { h = ((g - b) / c) % 6; }
  else if (M === g) { h = ((b - r) / c) + 2; }
  else if (M === b) { h = ((r - g) / c) + 4; }
  h *= 60;

  return { value : M, hue : h, saturation : (M === 0 ? 0 : c / M) };
 }

 function between(lo,hi,x) { return lo <= x && x < hi; }
 function norm(n) { return Math.round(n*255); }

 function toRGB(hsv) {
  var c = hsv.value * hsv.saturation;
  var hue = hsv.hue / 60;
  var x = c * (1 - Math.abs((hue % 2) - 1));
  var r = 0, g = 0, b = 0;
       if (between(0,1,hue)) { r = c; g = x; b = 0; }
  else if (between(1,2,hue)) { r = x; g = c; b = 0; }
  else if (between(2,3,hue)) { r = 0; g = c; b = x; }
  else if (between(3,4,hue)) { r = 0; g = x; b = c; }
  else if (between(4,5,hue)) { r = x; g = 0; b = c; }
  else if (between(5,6,hue)) { r = c; g = 0; b = x; }

  var m = hsv.value - c;
  return { ctor:"Color", _0:norm(r+m), _1:norm(g+m), _2:norm(b+m), _3:1 };
 }

 return elm.Native.Color = {
    hsva:F4(hsva),
    hsv:F3(hsv),
    complement:complement
 };

};
Elm.Native.Date = function(elm) {
 'use strict';

 elm.Native = elm.Native || {};
 if (elm.Native.Date) return elm.Native.Date;

 var JS = Elm.JavaScript(elm);
 var Maybe = Elm.Maybe(elm);

 function dateNow() { return new window.Date; }
 function readDate(str) {
     var d = new window.Date(JS.fromString(str));
     if (isNaN(d.getTime())) return Maybe.Nothing;
     return Maybe.Just(d);
 }

 var dayTable = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 var monthTable = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 

 return elm.Native.Date = {
     read    : readDate,
     year    : function(d) { return d.getFullYear(); },
     month   : function(d) { return { ctor:monthTable[d.getMonth()] }; },
     day     : function(d) { return d.getDate(); },
     hour    : function(d) { return d.getHours(); },
     minute  : function(d) { return d.getMinutes(); },
     second  : function(d) { return d.getSeconds(); },
     toTime  : function(d) { return d.getTime(); },
     dayOfWeek : function(d) { return { ctor:dayTable[d.getDay()] }; }
 };

};

Elm.Native.Error = function(elm) {
    'use strict';
    elm.Native = elm.Native || {};
    if (elm.Native.Error) return elm.Native.Error;

    var fromString = Elm.Native.JavaScript(elm).fromString;

    function Case(span) { 
	var msg = 'Non-exhaustive pattern match in case expression'
	throw new Error(msg + " (" + span + ")")
    }

    function If(span) { 
	var msg = 'Non-exhaustive pattern match in multi-way-if expression'
	throw new Error(msg + " (" + span + ")")
    }

    function raise(str) { throw new Error(fromString(str)); }

    return elm.Native.Error = { Case: Case, If: If, raise: raise };
};
function F2(fun) {
  function wrapper(a) { return function(b) { return fun(a,b) } }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun) {
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a,b,c) }}
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a,b,c,d) }}}
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a,b,c,d,e) }}}}
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
      return fun(a,b,c,d,e,f) }}}}}
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
      return function(g) { return fun(a,b,c,d,e,f,g) }}}}}}
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
	return function(g) { return function(h) {return fun(a,b,c,d,e,f,g,h)}}}}}}}
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun) {
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
	return function(g) { return function(h) { return function(i) {
        return fun(a,b,c,d,e,f,g,h,i) }}}}}}}}
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun,a,b) {
  return fun.arity === 2 ? fun.func(a,b) : fun(a)(b);
}
function A3(fun,a,b,c) {
  return fun.arity === 3 ? fun.func(a,b,c) : fun(a)(b)(c);
}
function A4(fun,a,b,c,d) {
  return fun.arity === 4 ? fun.func(a,b,c,d) : fun(a)(b)(c)(d);
}
function A5(fun,a,b,c,d,e) {
  return fun.arity === 5 ? fun.func(a,b,c,d,e) : fun(a)(b)(c)(d)(e);
}
function A6(fun,a,b,c,d,e,f) {
  return fun.arity === 6 ? fun.func(a,b,c,d,e,f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun,a,b,c,d,e,f,g) {
  return fun.arity === 7 ? fun.func(a,b,c,d,e,f,g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun,a,b,c,d,e,f,g,h) {
  return fun.arity === 8 ? fun.func(a,b,c,d,e,f,g,h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun,a,b,c,d,e,f,g,h,i) {
  return fun.arity === 9 ? fun.func(a,b,c,d,e,f,g,h,i)
                         : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

Elm.Native.JavaScript = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.JavaScript) return elm.Native.JavaScript;

  var List = Elm.Native.List(elm);
  var Render = ElmRuntime.use(ElmRuntime.Render.Element);

  function fromJS(v) {
    var type = typeof v;
    if (type === 'number' ) return v;
    if (type === 'boolean') return v;
    if (type === 'string' ) return List.fromArray(v);
    if (v instanceof Array) {
      var arr = [];
      var len = v.length;
      for (var i = 0; i < len; ++i) {
	var x = fromJS(v[i]);
	if (x !== null) arr.push(x);
      }
      return List.fromArray(arr);
    }
    if (type === 'object') {
      var rec = { _:{} };
      for (var f in v) {
	var x = fromJS(v[f]);
	if (x !== null) rec[f] = x;
      }
      return rec;
    }
    return null;
  }

  function toJS(v) {
    var type = typeof v;
    if (type === 'number' || type === 'boolean') return v;
    if (type === 'object' && '_' in v) {
	var obj = {};
	for (var k in v) {
	    var x = v[k];
	    if (x !== null) obj[k] = x;
	}
	return obj;
    }
    if (type === 'object' && (v.ctor === 'Cons' || v.ctor === 'Nil')) {
	var array = List.toArray(v);
	for (var i = array.length; i--; ) {
	    array[i] = toJS(array[i]);
	}
	if (typeof array[0] === 'string') array.join('');
	return array;
    }
    return null;
  }
  
  function fromRecord(r) {
    if (typeof r === 'object' && '_' in r) {
      return toJS(r);
    }
    throw new Error("'fromRecord' must be called on a record.");
  }

  function id(n) { return n; }

  function toElement(w,h,domNode) {
      return A3( newElement, w, h, {
              ctor: 'Custom',
              type: 'DomNode',
              render: function(node) { return node; },
              update: function(node,oldNode,newNode) {
                  if (node === newNode) return;
                  node.parentNode.replaceChild(newNode, node);
              },
              model: domNode
          });
  }

  function fromElement(element) {
      return Render.render(element);
  }

  return elm.Native.JavaScript = {
      toFloat    : id,
      toBool     : id,
      toInt      : function(n) { return n|0; },
      toString   : List.fromArray,
      toList     : List.fromArray,
      fromString : function(s) { return List.toArray(s).join(''); },
      fromList   : List.toArray,
      fromInt    : id,
      fromFloat  : id,
      fromBool   : id,

      toElement   : toElement,
      fromElement : fromElement,
      toRecord    : fromJS,
      fromRecord  : fromRecord
  };

};
Elm.Native.Json = function(elm) {
  'use strict';

  var Maybe = Elm.Maybe(elm);
  var Dict = Elm.Dict(elm);
  var List = Elm.List(elm);
  var JS = Elm.JavaScript(elm);
  var Utils = Elm.Native.Utils(elm);

  function fromValue(v) {
    switch (v.ctor) {
    case 'Null'   : return null;
    case 'String' : return JS.fromString(v._0);
    case 'Object' :
      var obj = {};
      var array = JS.fromList(Dict.toList(v._0));
      for (var i = arr.length; i--; ) {
	obj[JS.fromString(array[i]._0)] = fromValue(array[i]._1);
      }
      return obj;
    case 'Array'  :
      var array = JS.fromList(v._0);
      for (var i = array.length; i--; ) {
	array[i] = fromValue(array[i]);
      }
      return array;
    default :
      return v._0;
    }
  }

  function toPrettyJSString(sep, obj) {
    return JSON.stringify(fromValue(obj), null, JS.fromString(sep));
  }

  function toValue(v) {
    switch (typeof v) {
    case 'string' : return { ctor:"String", _0: JS.toString(v) };
    case 'number' : return { ctor:"Number", _0: JS.toFloat(v)  };
    case 'boolean': return { ctor:"Bool"  , _0: JS.toBool(v)   };
    case 'object' :
      if (v === null) return { ctor:"Null" };
      if (v instanceof Array) {
          for (var i = v.length; i--; ) { v[i] = toValue(v[i]); }
	  return { ctor:"Array", _0: JS.toList(v) };
      }
      var array = [];
      for (var k in v) array.push(Utils.Tuple2(JS.toString(k), toValue(v[k])));
      return { ctor:"Object", _0: Dict.fromList(JS.toList(array)) };
    }
  }

  function fromJSString(str) {
    try {
	return Maybe.Just(toValue(JSON.parse(str)));
    } catch (e) {
	return Maybe.Nothing;
    }
  }

  return elm.Native.Json = {
      toJSString : F2(toPrettyJSString),
      fromJSString : fromJSString,
      toJSObject : fromValue,
      fromJSObject : toValue
  };

};
Elm.Native.List = function(elm) {
  "use strict";

  elm.Native = elm.Native || {};
  if (elm.Native.List) return elm.Native.List;
  if ('values' in Elm.Native.List)
      return elm.Native.List = Elm.Native.List.values;

  var Utils = Elm.Native.Utils(elm);

  // TODO: Improve Nil handling
  // We can change places like:  if (xs.ctor === 'Nil') ... to if (xs === Nil) ...
  // but only if we're confident Nil can only be defined once.
  // Currently (27Mar2013) each module can have different instantiations, so multiple Nil objects can exist
  // (and if they're used interchangeably then direct object comparison fails where ctor doesn't).
  // So, this can only be fixed when modules initialisation is also fixed.
  // The performance overhead of the .ctor calls is 5-10% according to jsperf (depending on fn + list size)
  // (on firefox 19)

  var Nil = { ctor:'Nil' };

  // using freeze for every cons would be nice but is a huge (9x on firefox 19)
  // performance penalty
  function Cons(hd,tl) { return { ctor:"Cons", _0:hd, _1:tl }; }

  function throwError(f) {
    throw new Error("Function '" + f + "' expects a non-empty list!");
  }

  function toArray(xs) {
    var out = [];
    while (xs.ctor !== 'Nil') {
      out.push(xs._0);
      xs = xs._1;
    }
    return out;
  }

  function fromArray(arr) {
    var out = Nil;
    for (var i = arr.length; i--; ) {
      out = Cons(arr[i], out);
    }
    return out;
  }

  function range(lo,hi) {
    var lst = Nil;
    if (lo <= hi) {
      do { lst = Cons(hi,lst) } while (hi-->lo);
    }
    return lst
  }

  function append(xs,ys) {
    if (typeof xs === "string") { return xs.concat(ys); }
    if (xs.ctor === 'Nil') { return ys; }
    var root = Cons(xs._0, Nil);
    var curr = root;
    xs = xs._1;
    while (xs.ctor !== 'Nil') {
	curr._1 = Cons(xs._0, Nil);
	xs = xs._1;
	curr = curr._1;
    }
    curr._1 = ys;
    return root;
  }

  function head(v) { return v.ctor === 'Nil' ? throwError('head') : v._0; }
  function tail(v) { return v.ctor === 'Nil' ? throwError('tail') : v._1; }

  function last(xs) {
    if (xs.ctor === 'Nil') { throwError('last'); }
    var out = xs._0;
    while (xs.ctor !== 'Nil') {
      out = xs._0;
      xs = xs._1;
    }
    return out;
  }

  function map(f, xs) {
    var arr = [];
    while (xs.ctor !== 'Nil') {
      arr.push(f(xs._0));
      xs = xs._1;
    }
    return fromArray(arr);
  }

   // f defined similarly for both foldl and foldr (NB: different from Haskell)
   // ie, foldl :: (a -> b -> b) -> b -> [a] -> b
  function foldl(f, b, xs) {
    var acc = b;
    while (xs.ctor !== 'Nil') {
      acc = A2(f, xs._0, acc);
      xs = xs._1;
    }
    return acc;
  }

  function foldr(f, b, xs) {
    var arr = toArray(xs);
    var acc = b;
    for (var i = arr.length; i--; ) {
      acc = A2(f, arr[i], acc);
    }
    return acc;
  }

  function foldl1(f, xs) {
    return xs.ctor === 'Nil' ? throwError('foldl1') : foldl(f, xs._0, xs._1);
  }

  function foldr1(f, xs) {
    if (xs.ctor === 'Nil') { throwError('foldr1'); }
    var arr = toArray(xs);
    var acc = arr.pop();
    for (var i = arr.length; i--; ) {
      acc = A2(f, arr[i], acc);
    }
    return acc;
  }

  function scanl(f, b, xs) {
    var arr = toArray(xs);
    arr.unshift(b);
    var len = arr.length;
    for (var i = 1; i < len; ++i) {
      arr[i] = A2(f, arr[i], arr[i-1]);
    }
    return fromArray(arr);
  }

  function scanl1(f, xs) {
    return xs.ctor === 'Nil' ? throwError('scanl1') : scanl(f, xs._0, xs._1);
  }

  function filter(pred, xs) {
    var arr = [];
    while (xs.ctor !== 'Nil') {
      if (pred(xs._0)) { arr.push(xs._0); }
      xs = xs._1;
    }
    return fromArray(arr);
  }

  function length(xs) {
    var out = 0;
    while (xs.ctor !== 'Nil') {
      out += 1;
      xs = xs._1;
    }
    return out;
  }

  function member(x, xs) {
    while (xs.ctor !== 'Nil') {
      if (Utils.eq(x,xs._0)) return true;
      xs = xs._1;
    }
    return false;
  }

  function reverse(xs) { return fromArray(toArray(xs).reverse()); }

  function concat(xss) {
      if (xss.ctor === 'Nil') return xss;
      var arr = toArray(xss);
      var xs = arr[arr.length-1];
      for (var i = arr.length-1; i--; ) {
	  xs = append(arr[i], xs);
      }
      return xs;
  }

  function all(pred, xs) {
    while (xs.ctor !== 'Nil') {
      if (!pred(xs._0)) return false;
      xs = xs._1;
    }
    return true;
  }

  function any(pred, xs) {
    while (xs.ctor !== 'Nil') {
      if (pred(xs._0)) return true;
      xs = xs._1;
    }
    return false;
  }

  function zipWith(f, xs, ys) {
    var arr = [];
    while (xs.ctor !== 'Nil' && ys.ctor !== 'Nil') {
      arr.push(A2(f, xs._0, ys._0));
      xs = xs._1;
      ys = ys._1;
    }
    return fromArray(arr);
  }

  function zip(xs, ys) {
    var arr = [];
    while (xs.ctor !== 'Nil' && ys.ctor !== 'Nil') {
      arr.push(Utils.Tuple2(xs._0, ys._0));
      xs = xs._1;
      ys = ys._1;
    }
    return fromArray(arr);
  }

  function sort(xs) {
    function cmp(a,b) {
      var ord = Utils.compare(a,b).ctor;
      return ord=== 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
    }
    return fromArray(toArray(xs).sort(cmp));
  }

  function take(n, xs) {
    var arr = [];
    while (xs.ctor !== 'Nil' && n > 0) {
      arr.push(xs._0);
      xs = xs._1;
      --n;
    }
    return fromArray(arr);
  }

  function drop(n, xs) {
    while (xs.ctor !== 'Nil' && n > 0) {
      xs = xs._1;
      --n;
    }
    return xs;
  }

  function join(sep, xss) {
    if (typeof sep === 'string') return toArray(xss).join(sep);
    if (xss.ctor === 'Nil') return Nil;
    var s = toArray(sep);
    var out = toArray(xss._0);
    xss = xss._1;
    while (xss.ctor !== 'Nil') {
      out = out.concat(s, toArray(xss._0));
      xss = xss._1;
    }
    return fromArray(out);
  }

  function split(seperator, list) {
    var array = toArray(list);
    var alen = array.length;
    if (alen === 0) {
      // splitting an empty list is a list of lists: [[]]
      return Cons(Nil,Nil);
    }

    var sep = toArray(seperator);
    var seplen = sep.length;
    if (seplen === 0) {
      // splitting with an empty sep is a list of all elements
      // Same as (map (\x -> [x]) list)
      var out = Nil;
      for (var i = alen; i--; ) {
        out = Cons(Cons(array[i],Nil), out);
      }
      return out;
    }

    var matches = [-seplen];
    var sepStart = sep[0];
    var len = alen - seplen + 1;
    for (var i = 0; i < len; ++i) {
      if (Utils.eq(array[i], sepStart)) {
        var match = true;
        for (var j = seplen; --j; ) {
          if (!Utils.eq(array[i+j], sep[j])) { match = false;  break; }
        }
        if (match) {
          console.log(i);
          matches.push(i);
          i += seplen - 1;
        }
      }
    }

    // shortcut in case of no matches
    if (matches.length === 0) {
      return Cons(list,Nil);
    }

    var out = Nil;
    var index = alen - 1;
    for (var i = matches.length; i--; ) {
      console.log('starts at', index);
      var temp = Nil;
      var stop = matches[i] + seplen - 1;
      for ( ; index > stop; --index ) {
        temp = Cons(array[index], temp);
      }
      console.log(toArray(temp));
      out = Cons(temp,out);
      console.log('ends at', index);
      index -= seplen;
    }
    return out;
  }

  Elm.Native.List.values = {
      Nil:Nil,
      Cons:Cons,
      toArray:toArray,
      fromArray:fromArray,
      range:range,
      append:append,

      head:head,
      tail:tail,
      last:last,

      map:F2(map),
      foldl:F3(foldl),
      foldr:F3(foldr),

      foldl1:F2(foldl1),
      foldr1:F2(foldr1),
      scanl:F3(scanl),
      scanl1:F2(scanl1),
      filter:F2(filter),
      length:length,
      member:F2(member),
      reverse:reverse,
      concat:concat,

      all:F2(all),
      any:F2(any),
      zipWith:F3(zipWith),
      zip:F2(zip),
      sort:sort,
      take:F2(take),
      drop:F2(drop),

      join:F2(join),
      split:F2(split)
  };
  return elm.Native.List = Elm.Native.List.values;

};
Elm.Native.Matrix2D = function(elm) {
 "use strict";

 elm.Native = elm.Native || {};
 if (elm.Native.Matrix2D) return elm.Native.Matrix2D;

 if (typeof Float32Array === 'undefined'){ Float32Array = Array; }
 var A = Float32Array;

 // layout of matrix in an array is
 //
 //   | m11 m12 dx |
 //   | m21 m22 dy |
 //   |  0   0   1 |
 //
 //  new A([ m11, m12, dx, m21, m22, dy ])

 var identity = new A([1,0,0,0,1,0]);
 function matrix(m11, m12, m21, m22, dx, dy) {
     return new A([m11, m12, dx, m21, m22, dy]);
 }
 function rotation(t) {
     var c = Math.cos(t);
     var s = Math.sin(t);
     return new A([c, -s, 0, s, c, 0]);
 }

 function rotate(t,m) {
     var c = Math.cos(t);
     var s = Math.sin(t);
     var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
     return new A([m11*c + m12*s, -m11*s + m12*c, m[2],
                   m21*c + m22*s, -m21*s + m22*c, m[5]]);
 }
 /*
 function move(xy,m) {
     var x = xy._0;
     var y = xy._1;
     var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
     return new A([m11, m12, m11*x + m12*y + m[2],
                   m21, m22, m21*x + m22*y + m[5]]);
 }
 function scale(s,m) { return new A([m[0]*s, m[1]*s, m[2], m[3]*s, m[4]*s, m[5]]); }
 function scaleX(x,m) { return new A([m[0]*x, m[1], m[2], m[3]*x, m[4], m[5]]); }
 function scaleY(y,m) { return new A([m[0], m[1]*y, m[2], m[3], m[4]*y, m[5]]); }
 function reflectX(m) { return new A([-m[0], m[1], m[2], -m[3], m[4], m[5]]); }
 function reflectY(m) { return new A([m[0], -m[1], m[2], m[3], -m[4], m[5]]); }

 function transform(m11, m21, m12, m22, mdx, mdy, n) {
     var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
     return new A([m11*n11 + m12*n21,
                   m11*n12 + m12*n22,
                   m11*ndx + m12*ndy + mdx,
                   m21*n11 + m22*n21,
                   m21*n12 + m22*n22,
                   m21*ndx + m22*ndy + mdy]);
 }
 */
 function multiply(m, n) {
     var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4], mdx = m[2], mdy = m[5];
     var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
     return new A([m11*n11 + m12*n21,
                   m11*n12 + m12*n22,
                   m11*ndx + m12*ndy + mdx,
                   m21*n11 + m22*n21,
                   m21*n12 + m22*n22,
                   m21*ndx + m22*ndy + mdy]);
 }

 return elm.Native.Matrix2D = {
     identity:identity,
     matrix:F6(matrix),
     rotation:rotation,
     multiply:F2(multiply)
     /*
     transform:F7(transform),
     rotate:F2(rotate),
     move:F2(move),
     scale:F2(scale),
     scaleX:F2(scaleX),
     scaleY:F2(scaleY),
     reflectX:reflectX,
     reflectY:reflectY
     */
 };

};

Elm.Native.Prelude = function(elm) {
  'use strict';
  if (elm.Native.Prelude) return elm.Native.Prelude;

  var JS = Elm.JavaScript(elm);
  var Maybe = Elm.Maybe(elm);
  var Utils = Elm.Native.Utils(elm);
  var Char = Elm.Char(elm);

  function div(a,b) { return (a/b)|0; }
  function rem(a,b) { return a % b; }
  var mod = Utils.mod;
  function abs(x) { return x < 0 ? -x : x; }
  function logBase(base,n) { return Math.log(n) / Math.log(base); }
  function min(a,b) { return a < b ? a : b; }
  function max(a,b) { return a > b ? a : b; }
  function clamp(lo,hi,n) { return n < lo ? lo : n > hi ? hi : n; }
  function xor(a,b) { return a !== b; }
  function not(b) { return !b; }

  function truncate(n) { return n|0; }

  function id(n) { return n; }
  function flip(f,a,b) { return A2(f,b,a); }
  function curry(f,a,b) { return f(Utils.Tuple2(a,b)); }
  function uncurry(f,v) { return A2(f,v._0,v._1); }
  function fst(t) { return t._0; }
  function snd(t) { return t._1; }

  function readInt(str) {
    var s = JS.fromString(str);
    var len = s.length;
    if (len === 0) { return Maybe.Nothing; }
    var start = 0;
    if (s[0] == '-') {
      if (len === 1) { return Maybe.Nothing; }
      start = 1;
    }
    for (var i = start; i < len; ++i) {
      if (!Char.isDigit(s[i])) { return Maybe.Nothing; }
    }
    return Maybe.Just(parseInt(s, 10));
  }

  function readFloat(str) {
    var s = JS.fromString(str);
    var len = s.length;
    if (len === 0) { return Maybe.Nothing; }
    var start = 0;
    if (s[0] == '-') {
      if (len === 1) { return Maybe.Nothing; }
      start = 1;
    }
    var dotCount = 0;
    for (var i = start; i < len; ++i) {
      if (Char.isDigit(s[i])) { continue; }
      if (s[i] === '.') {
        dotCount += 1;
        if (dotCount <= 1) { continue; }
      }
      return Maybe.Nothing;
    }
    return Maybe.Just(parseFloat(s));
  }

  var prelude = {
      div:F2(div),
      rem:F2(rem),
      mod:mod,

      pi:Math.PI,
      e:Math.e,
      cos:Math.cos,
      sin:Math.sin,
      tan:Math.tan,
      acos:Math.acos,
      asin:Math.asin,
      atan:Math.atan,
      atan2:F2(Math.atan2),

      sqrt:Math.sqrt,
      abs:abs,
      logBase:F2(logBase),
      min:F2(min),
      max:F2(max),
      clamp:F3(clamp),
      compare:Utils.compare,

      xor:F2(xor),
      not:not,
      otherwise:true,

      truncate:truncate,
      ceiling:Math.ceil,
      floor:Math.floor,
      round:Math.round,
      toFloat:id,

      readInt:readInt,
      readFloat:readFloat,

      id:id,
      flip:F3(flip),
      curry:F3(curry),
      uncurry:F2(uncurry),
      fst:fst,
      snd:snd
  };

  function add(Module) {
    var M = Module(elm);
    for (var k in M) { prelude[k] = M[k]; }
  }
  add(Elm.Native.Show);
  add(Elm.Signal);
  add(Elm.List);
  add(Elm.Maybe);
  add(Elm.Time);
  add(Elm.Graphics.Element);

  return elm.Native.Prelude = prelude;
};

Elm.Native.Show = function(elm) {
    'use strict';

    elm.Native = elm.Native || {};
    if (elm.Native.Show) return elm.Native.Show;

    var NList = Elm.Native.List(elm);
    var List = Elm.List(elm);
    var Maybe = Elm.Maybe(elm);
    var JS = Elm.JavaScript(elm);
    var Dict = Elm.Dict(elm);
    var Json = Elm.Json(elm);
    var Tuple2 = Elm.Native.Utils(elm).Tuple2;

    var toString = function(v) {
        if (typeof v === "function") {
            var name = v.func ? v.func.name : v.name;
            return '<function' + (name === '' ? '' : ': ') + name + '>';
        } else if (typeof v === "boolean") {
            return v ? "True" : "False";
        } else if (typeof v === "number") {
            return v+"";
        } else if (typeof v === "string" && v.length < 2) {
            return "'" + showChar(v) + "'";
        } else if (typeof v === "object" && '_' in v) {
            var output = [];
            for (var k in v._) {
                for (var i = v._[k].length; i--; ) {
                    output.push(k + " = " + toString(v._[k][i]));
                }
            }
            for (var k in v) {
                if (k === '_') continue;
                output.push(k + " = " + toString(v[k]));
            }
            if (output.length === 0) return "{}";
            return "{ " + output.join(", ") + " }";
        } else if (typeof v === "object" && 'ctor' in v) {
            if (v.ctor.substring(0,5) === "Tuple") {
                var output = [];
                for (var k in v) {
                    if (k === 'ctor') continue;
                    output.push(toString(v[k]));
                }
                return "(" + output.join(",") + ")";
            } else if (v.ctor === "Cons") {
                var isStr = typeof v._0 === "string",
                start = isStr ? '"' : "[",
                end   = isStr ? '"' : "]",
                sep   = isStr ?  "" : ",",
                f     = !isStr ? toString : showChar;
                var output = start + f(v._0);
                v = v._1;
                while (v.ctor === "Cons") {
                    output += sep + f(v._0);
                    v = v._1;
                }
                return output + end;
            } else if (v.ctor === "Nil") {
                return "[]";
            } else if (v.ctor === "RBNode" || v.ctor === "RBEmpty") {
                var cons = F3(function(k,v,acc){return NList.Cons(Tuple2(k,v),acc)});
                var list = A3(Dict.foldr, cons, NList.Nil, v);
                var name = "Dict";
                if (list.ctor === "Cons" && list._0._1.ctor === "Tuple0") {
                    name = "Set";
                    list = A2(List.map, function(x){return x._0}, list);
                }
                return name + ".fromList " + toString(list);
            } else {
                var output = "";
                for (var i in v) {
                    if (i === 'ctor') continue;
                    var str = toString(v[i]);
                    var parenless = str[0] === '{' || str.indexOf(' ') < 0;
                    output += ' ' + (parenless ? str : '(' + str + ')');
                }
                return v.ctor + output;
            }
        }
        return v+"";
    };
    function show(v) { return NList.fromArray(toString(v)); }

    function showChar (c) {
        return c === '\n' ? '\\n' :
               c === '\t' ? '\\t' :
               c === '\b' ? '\\b' :
               c === '\r' ? '\\r' :
               c === '\v' ? '\\v' :
               c === '\0' ? '\\0' :
               c === '\'' ? "\\'" :
               c === '\"' ? '\\"' :
               c === '\\' ? '\\\\' : c;
    }

    return elm.Native.Show = { show:show };
};

Elm.Native.Text = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.Text) return elm.Native.Text;

  var JS = Elm.JavaScript(elm);
  var htmlHeight = Elm.Native.Utils(elm).htmlHeight;
  var Color = Elm.Native.Color(elm);
  var Element = Elm.Graphics.Element(elm);
  var show = Elm.Native.Show(elm).show;

  function makeSpaces(s) {
    if (s.length == 0) { return s; }
    var arr = s.split('');
    if (arr[0] == ' ') { arr[0] = "&nbsp;" }      
    for (var i = arr.length; --i; ) {
      if (arr[i][0] == ' ' && arr[i-1] == ' ') {
        arr[i-1] = arr[i-1] + arr[i];
        arr[i] = '';
      }
    }
    for (var i = arr.length; i--; ) {
      if (arr[i].length > 1 && arr[i][0] == ' ') {
        var spaces = arr[i].split('');
        for (var j = spaces.length - 2; j >= 0; j -= 2) {
          spaces[j] = '&nbsp;';
        }
        arr[i] = spaces.join('');
      }
    }
    arr = arr.join('');
    if (arr[arr.length-1] === " ") {
	return arr.slice(0,-1) + '&nbsp;';
    }
    return arr;
  }

  function properEscape(str) {
    if (str.length == 0) return str;
    str = str //.replace(/&/g,  "&#38;")
	.replace(/"/g, /*"*/ '&#34;')
	.replace(/'/g, /*'*/ "&#39;")
	.replace(/</g,  "&#60;")
	.replace(/>/g,  "&#62;")
	.replace(/\n/g, "<br/>");
    var arr = str.split('<br/>');
    for (var i = arr.length; i--; ) {
	arr[i] = makeSpaces(arr[i]);
    }
    return arr.join('<br/>');
  }

  function toText(str) { return properEscape(JS.fromString(str)); }

  function addTag(tag) { return function(text) {
      return '<' + tag + ' style="padding:0;margin:0">' + text + '</' + tag + '>';
    }
  }
  
  function addStyle(style, value, text) {
    return "<span style='" + style + ":" + value + "'>" + text + "</span>";
  }

  function typeface(name, text) {
    return addStyle('font-family', JS.fromString(name), text);
  }
  function monospace(text) {
    return addStyle('font-family', 'monospace', text);
  }
  function size(px, text) { return addStyle('font-size', px + 'px', text) }
  var header = addTag('h1');
  function height(h, text) { return addStyle('font-size', h+'em', text) }
  function italic(text) { return addStyle('font-style', 'italic', text) }
  var bold = addTag('b');

  function extract(c) {
    if (c._3 === 1) { return 'rgb(' + c._0 + ',' + c._1 + ',' + c._2 + ')'; }
    return 'rgba(' + c._0 + ',' + c._1 + ',' + c._2 + ',' + c._3 + ')';
  }
  function color(c, text) {
    return addStyle('color', extract(c), text);
  }
  function underline(text) { return addStyle('text-decoration', 'underline', text) }
  function overline(text) { return addStyle('text-decoration', 'overline', text) }
  function strikeThrough(text) {
      return addStyle('text-decoration', 'line-through', text);
  }
  function link(href, text) {
    return "<a href='" + toText(href) + "'>" + text + "</a>";
  }

  function position(pos) { return function(text) {
    var e = {ctor:'RawHtml',
	     _0: '<div style="padding:0;margin:0;text-align:' +
                   pos + '">' + text + '</div>'
            };
    var p = A2(htmlHeight, 0, text);
    return A3(Element.newElement, p._0, p._1, e);
   }
  }

  function asText(v) {
      return position('left')(monospace(toText(show(v))));
  }

  function plainText(v) {
      return position('left')(toText(v));
  }

  return elm.Native.Text = {
      toText: toText,

      header : header,
      height : F2(height),
      italic : italic,
      bold : bold,
      underline : underline,
      overline : overline,
      strikeThrough : strikeThrough,
      monospace : monospace,
      typeface : F2(typeface),
      color : F2(color),
      link : F2(link),

      justified : position('justify'),
      centered : position('center'),
      righted : position('right'),
      text : position('left'),
      plainText : plainText,

      asText : asText
  };

};
Elm.Native.Utils = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.Utils) return elm.Native.Utils;

  function eq(x,y) {
    if (x === y) return true;
    if (typeof x === "object") {
      var c = 0;
      for (var i in x) { ++c; if (!eq(x[i],y[i])) return false; }
      return c === Object.keys(y).length;
    }
    if (typeof x === 'function') {
      throw new Error('Equality error: general function equality is ' +
      'undecidable, and therefore, unsupported');
    }
    return x === y;
  }

  var EQ = 0, LT = 1, GT = 2, ord = ['EQ','LT','GT'];
  function compare(x,y) { return { ctor: ord[cmp(x,y)] } }
  function cmp(x,y) {
    var ord;
    if (typeof x !== 'object') return x === y ? EQ : x < y ? LT : GT;

    if (x.ctor === "Cons" || x.ctor === "Nil") {
      while (true) {
          if (x.ctor === "Nil" && y.ctor === "Nil") return EQ;
          if (x.ctor !== y.ctor) return x.ctor === 'Nil' ? LT : GT;
          ord = cmp(x._0, y._0);
          if (ord !== EQ) return ord;
          x = x._1;
          y = y._1;
      }
    }

    if (x.ctor.slice(0,5) === 'Tuple') {
      var n = x.ctor.slice(5) - 0;
      var err = 'cannot compare tuples with more than 6 elements.';
      if (n === 0) return EQ;
      if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
      if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
      if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
      if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
      if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
      if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
      if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
      return EQ;
    }
    throw new Error('Comparison error: comparison is only defined on ints, ' +
        'floats, times, chars, strings, lists of comparable values, ' +
        'and tuples of comparable values.')
  }


  var Tuple0 = { ctor: "Tuple0" };
  function Tuple2(x,y) { return { ctor:"Tuple2", _0:x, _1:y } }

  var count = 0;
  function guid(_) { return count++ }

  function copy(r) {
    var o = {};
    for (var i in r) { o[i] = r[i]; }
    return o;
  }

  function remove(x,r) {
    var o = copy(r);
    if (x in o._) {
      o[x] = o._[x][0];
      o._[x] = o._[x].slice(1);
      if (o._[x].length === 0) { delete o._[x]; }
    } else {
      delete o[x];
    }
    return o;
  }

  function replace(kvs,r) {
    var o = copy(r);
    for (var i = kvs.length; i--; ) {
      var kvsi = kvs[i];
      o[kvsi[0]] = kvsi[1];
    }
    return o;
  }

  function insert(x,v,r) {
    var o = copy(r);
    if (x in o) o._[x] = [o[x]].concat(x in o._ ? o._[x].slice(0) : []);
    o[x] = v;
    return o;
  }

  function max(a,b) { return a > b ? a : b }
  function min(a,b) { return a < b ? a : b }

  function mod(a,b) {
    var r = a % b;
    var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r+b) : -mod(-a,-b));

    return m === b ? 0 : m;
  }

  function htmlHeight(width, html) {
    var t = document.createElement('div');
    t.innerHTML = html;
    if (width > 0) { t.style.width = width + "px"; }
    t.style.visibility = "hidden";
    t.style.styleFloat = "left";
    t.style.cssFloat   = "left";

    elm.node.appendChild(t);
    var w = t.clientWidth;
    var h = t.clientHeight;
    elm.node.removeChild(t);
    return Tuple2(w,h);
  }

  function adjustOffset() {
      var node = elm.node;
      var offsetX = 0, offsetY = 0;
      if (node.offsetParent) {
          do {
              offsetX += node.offsetLeft;
              offsetY += node.offsetTop;
          } while (node = node.offsetParent);
      }
      elm.node.offsetX = offsetX;
      elm.node.offsetY = offsetY;
  }

  if (elm.display === ElmRuntime.Display.COMPONENT) {
      elm.node.addEventListener('mouseover', adjustOffset);
  }

  return elm.Native.Utils = {
      eq:eq,
      cmp:compare,
      compare:F2(compare),
      Tuple0:Tuple0,
      Tuple2:Tuple2,
      copy: copy,
      remove: remove,
      replace: replace,
      insert: insert,
      guid: guid,
      max : F2(max),
      min : F2(min),
      mod : F2(mod),
      htmlHeight: F2(htmlHeight),
      toFloat: function(x){return x}
  };
};

Elm.Native.Graphics.Collage = function(elm) {
 "use strict";

 elm.Native = elm.Native || {};
 elm.Native.Graphics = elm.Native.Graphics || {};
 if (elm.Native.Graphics.Collage) return elm.Native.Graphics.Collage;

 var newElement = Elm.Graphics.Element(elm).newElement;
 var C = ElmRuntime.use(ElmRuntime.Render.Collage);

 function collage(w,h,forms) {
     return A3(newElement, w, h, {
                 ctor: 'Custom',
		 type: 'Collage',
		 render: C.render,
		 update: C.update,
		 model: {w:w, h:h, forms:forms}
	 });
 }
 return elm.Native.Graphics.Collage = { collage:F3(collage) };

};
Elm.Native.Graphics.Input = function(elm) {
 "use strict";

 elm.Native = elm.Native || {};
 elm.Native.Graphics = elm.Native.Graphics || {};
 if (elm.Native.Graphics.Input) return elm.Native.Graphics.Input;

 var Render = ElmRuntime.use(ElmRuntime.Render.Element);
 var Utils = ElmRuntime.use(ElmRuntime.Render.Utils);
 var newNode = Utils.newElement, fromString = Utils.fromString,
     toString = Utils.toString;

 var Signal = Elm.Signal(elm);
 var newElement = Elm.Graphics.Element(elm).newElement;

 function buttons(defaultValue) {
     var events = Signal.constant(defaultValue);

     function render(model) {
	 var b = newNode('button');
	 b.style.display = 'block';
	 b.elmEvent = model.event;
	 function click() { elm.notify(events.id, b.elmEvent); }
	 b.addEventListener('click', click);
	 b.innerHTML = model.text;
	 return b;
     }

     function update(node, oldModel, newModel) {
	 node.elmEvent = newModel.event;
	 var txt = newModel.text;
	 if (oldModel.text !== txt) node.innerHTML = txt;
     }

     function button(evnt, txt) {
	 return A3(newElement, 100, 40, {
                     ctor: 'Custom',
		     type: 'Button',
		     render: render,
		     update: update,
		     model: { event:evnt, text:fromString(txt) }
	     });
     }

     return { _:{}, button:F2(button), events:events };
 }

 function customButtons(defaultValue) {
     var events = Signal.constant(defaultValue);

     function render(model) {
	 var btn = newNode('div');
	 btn.elmEvent = model.event;

	 btn.elmUp    = Render.render(model.up);
	 btn.elmHover = Render.render(model.hover);
	 btn.elmDown  = Render.render(model.down);

	 function replace(node) {
           if (node !== btn.firstChild) btn.replaceChild(node, btn.firstChild);
	 }
	 var overCount = 0;
	 function over(e) {
	     if (overCount++ > 0) return;
	     replace(btn.elmHover);
	 }
	 function out(e) {
	     if (btn.contains(e.toElement || e.relatedTarget)) return;
	     overCount = 0;
	     replace(btn.elmUp);
	 }
	 function up() {
	     replace(btn.elmHover);
	     elm.notify(events.id, btn.elmEvent);
	 }
	 function down() { replace(btn.elmDown); }
	 btn.addEventListener('mouseover', over);
	 btn.addEventListener('mouseout' , out);
	 btn.addEventListener('mousedown', down);
	 btn.addEventListener('mouseup'  , up);

	 btn.appendChild(btn.elmUp);
	 return btn;
     }

     function update(node, oldModel, newModel) {
	 node.elmEvent = newModel.event;
	 Render.update(node.elmUp, oldModel.up, newModel.up)
	 Render.update(node.elmHover, oldModel.hover, newModel.hover)
	 Render.update(node.elmDown, oldModel.down, newModel.down)
     }

     function button(evnt, up, hover, down) {
	 return A3(newElement,
		   Math.max(up.props.width, hover.props.width, down.props.width),
		   Math.max(up.props.height, hover.props.height, down.props.height),
                   { ctor: 'Custom',
		     type: 'CustomButton',
		     render: render,
		     update: update,
		     model: { event:evnt, up:up, hover:hover, down:down }
		   });
     }

     return { _:{}, button:F4(button), events:events };
 }


 function checkboxes(defaultValue) {
     var events = Signal.constant(defaultValue);

     function render(model) {
	 var b = newNode('input');
	 b.type = 'checkbox';
	 b.checked = model.checked;
	 b.style.display = 'block';
	 b.elmHandler = model.handler;
	 function change() { elm.notify(events.id, b.elmHandler(b.checked)); }
	 b.addEventListener('change', change);
	 return b;
     }

     function update(node, oldModel, newModel) {
	 node.elmHandler = newModel.handler;
	 node.checked = newModel.checked;
	 return true;
     }

     function box(handler, checked) {
	 return A3(newElement, 13, 13, {
                     ctor: 'Custom',
		     type: 'CheckBox',
		     render: render,
		     update: update,
		     model: { checked:checked, handler:handler  }
	     });
     }

     return { _:{}, box:F2(box), events:events };
 }

 function mkTextPool(type) { return function fields(defaultValue) {
     var events = Signal.constant(defaultValue);

     var state = null;

     function render(model) {
	 var field = newNode('input');
	 field.elmHandler = model.handler;

	 field.id = 'test';
	 field.type = type;
	 field.placeholder = fromString(model.placeHolder);
	 field.value = fromString(model.state.string);
	 field.setSelectionRange(model.state.selectionStart, model.state.selectionEnd);
	 field.style.border = 'none';
         state = model.state;

	 function update() {
	     var start = field.selectionStart,
		 end = field.selectionEnd;
	     if (field.selectionDirection === 'backward') {
		 start = end;
		 end = field.selectionStart;
	     }
             state = { _:{},
                       string:toString(field.value),
                       selectionStart:start,
                       selectionEnd:end };
	     elm.notify(events.id, field.elmHandler(state));
	 }
	 function mousedown() {
	     update();
	     elm.node.addEventListener('mouseup', mouseup);
	 }
	 function mouseup() {
	     update();
	     elm.node.removeEventListener('mouseup', mouseup)
	 }
	 field.addEventListener('keyup', update);
	 field.addEventListener('mousedown', mousedown);

	 return field;
     }

     function update(node, oldModel, newModel) {
	 node.elmHandler = newModel.handler;
         if (state === newModel.state) return;
         var newStr = fromString(newModel.state.string);
	 if (node.value !== newStr) node.value = newStr;

         var start = newModel.state.selectionStart;
         var end = newModel.state.selectionEnd;
         var direction = 'forward';
         if (end < start) {
             start = end;
             end = newModel.state.selectionStart;
             direction = 'backward';
         }
 
         if (node.selectionStart !== start
             || node.selectionEnd !== end
             || node.selectionDirection !== direction) {
             node.setSelectionRange(start, end, direction);
         }
     }

     function field(handler, placeHolder, state) {
	 return A3(newElement, 200, 30,
                   { ctor: 'Custom',
		     type: type + 'Input',
		     render: render,
		     update: update,
		     model: { handler:handler,
			      placeHolder:placeHolder,
			      state:state }
		   });
     }

     return { _:{}, field:F3(field), events:events };
   }
 }

 return elm.Native.Graphics.Input = {
     buttons:buttons,
     customButtons:customButtons,
     checkboxes:checkboxes,
     fields:mkTextPool('text'),
     emails:mkTextPool('email'),
     passwords:mkTextPool('password')
 };

};

Elm.Native.Http = function(elm) {
  'use strict';
  elm.Native = elm.Native || {};
  if (elm.Native.Http) return elm.Native.Http;


  var JS = Elm.JavaScript(elm);
  var List = Elm.List(elm);
  var Signal = Elm.Signal(elm);


  function registerReq(queue,responses) { return function(req) {
    if (req.url !== "") { sendReq(queue,responses,req); }
   };
  }

  function updateQueue(queue,responses) {
    if (queue.length > 0) {
      elm.notify(responses.id, queue[0].value);
      if (queue[0].value.ctor !== 'Waiting') {
        queue.shift();
        setTimeout(function() { updateQueue(queue,responses); }, 0);
      }
    }
  }

  function setHeader(pair) {
    request.setRequestHeader( JS.fomString(pair._0), JS.fromString(pair._1) );
  }

  function sendReq(queue,responses,req) {
    var response = { value: { ctor:'Waiting' } };
    queue.push(response);

    var request = null;
    if (window.ActiveXObject)  { request = new ActiveXObject("Microsoft.XMLHTTP"); }
    if (window.XMLHttpRequest) { request = new XMLHttpRequest(); }
    request.onreadystatechange = function(e) {
      if (request.readyState === 4) {
        response.value = (request.status === 200 ?
        { ctor:'Success', _0:JS.toString(request.responseText) } :
        { ctor:'Failure', _0:request.status, _1:JS.toString(request.statusText) });
        setTimeout(function() { updateQueue(queue,responses); }, 0);
      }
    };
    request.open(JS.fromString(req.verb), JS.fromString(req.url), true);
    List.map(setHeader)(req.headers);
    request.send(JS.fromString(req.body));
  }

  function send(requests) {
    var responses = Signal.constant(elm.Http.Waiting);
    var sender = A2( Signal.lift, registerReq([],responses), requests );
    function f(x) { return function(y) { return x; } }
    return A3( Signal.lift2, f, responses, sender );
  }

  return elm.Native.Http = {send:send};

};

Elm.Native.Keyboard = function(elm) {
  'use strict';
  elm.Native = elm.Native || {};
  if (elm.Native.Keyboard) return elm.Native.Keyboard;

  var Signal = Elm.Signal(elm);
  var NList = Elm.Native.List(elm);

  var keysDown = Signal.constant(NList.Nil);
  var lastKey = Signal.constant('\0');

  function down(e) {
      if (NList.member(e.keyCode)(keysDown.value)) return;
      var list = NList.Cons(e.keyCode, keysDown.value);
      var hasListener = elm.notify(keysDown.id, list);
      if (!hasListener) document.removeEventListener('keydown', down);
  }
  function up(e) {
      function notEq(kc) { return kc !== e.keyCode; }
      var codes = NList.filter(notEq)(keysDown.value);
      var hasListener = elm.notify(keysDown.id, codes);
      if (!hasListener) document.removeEventListener('keyup', up);
  }
  function blur(e) {
      var hasListener = elm.notify(keysDown.id, NList.Nil);
      if (!hasListener) document.removeEventListener('blur', blur);
  }
  function press(e) {
      var hasListener = elm.notify(lastKey.id, e.charCode || e.keyCode);
      if (!hasListener) document.removeEventListener('keypress', press);
  }

  document.addEventListener('keydown' , down );
  document.addEventListener('keyup'   , up   );
  document.addEventListener('blur'    , blur );
  document.addEventListener('keypress', press);

  function keySignal(f) {
    var signal = A2( Signal.lift, f, keysDown );
    keysDown.defaultNumberOfKids += 1;
    signal.defaultNumberOfKids = 0;
    return signal;
  }

  function dir(up, down, left, right) {
    function f(ks) {
      var x = 0, y = 0;
      while (ks.ctor == "Cons") {
        switch (ks._0) {
          case left : --x; break;
          case right: ++x; break;
          case up   : ++y; break;
          case down : --y; break;
        }
        ks = ks._1;
      }
      return { _:{}, x:x, y:y };
    }
    return keySignal(f);
  }

  function is(key) { return keySignal(NList.member(key)); }

  return elm.Native.Keyboard = {
      isDown:is,
      directions:F4(dir),
      keysDown:keysDown,
      lastPressed:lastKey
  };

};

Elm.Native.Mouse = function(elm) {
  'use strict';
  elm.Native = elm.Native || {};
  if (elm.Native.Mouse) return elm.Native.Mouse;

  var Signal = Elm.Signal(elm);
  var Utils = Elm.Native.Utils(elm);

  var position  = Signal.constant(Utils.Tuple2(0,0));
  position.defaultNumberOfKids = 2;

  // do not move x and y into Elm. By setting their default number
  // of kids, it is possible to detatch the mouse listeners if
  // they are not needed.
  var x = A2( Signal.lift, function(p){return p._0}, position);
  x.defaultNumberOfKids = 0;
  var y = A2( Signal.lift, function(p){return p._1}, position);
  y.defaultNumberOfKids = 0;

  var isDown    = Signal.constant(false);
  var isClicked = Signal.constant(false);
  var clicks = Signal.constant(Utils.Tuple0);

  function getXY(e) {
    var posx = 0;
    var posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
	posx = e.pageX;
	posy = e.pageY;
    } else if (e.clientX || e.clientY) 	{
	posx = e.clientX + document.body.scrollLeft +
	  document.documentElement.scrollLeft;
	posy = e.clientY + document.body.scrollTop +
	  document.documentElement.scrollTop;
    }
    return Utils.Tuple2(posx-elm.node.offsetX, posy-elm.node.offsetY);
  }

  var node = elm.display === ElmRuntime.Display.FULLSCREEN ? document : elm.node;

  function click(e) {
    var hasListener1 = elm.notify(isClicked.id, true);
    var hasListener2 = elm.notify(clicks.id, Utils.Tuple0);
    elm.notify(isClicked.id, false);
    if (!hasListener1 && !hasListener2)
	node.removeEventListener('click', click);
  }

  function down(e) {
    var hasListener = elm.notify(isDown.id, true);
    if (!hasListener) node.removeEventListener('mousedown', down);
  }

  function up(e) {
    var hasListener = elm.notify(isDown.id, false);
    if (!hasListener) node.removeEventListener('mouseup', up);
  }

  function move(e) {
    var hasListener = elm.notify(position.id, getXY(e));
    if (!hasListener) node.removeEventListener('mousemove', move);
  }

  node.addEventListener('click'    , click);
  node.addEventListener('mousedown', down);
  node.addEventListener('mouseup'  , up);
  node.addEventListener('mousemove', move);

  return elm.Native.Mouse = {
      position: position,
      x:x,
      y:y,
      isClicked: isClicked,
      isDown: isDown,
      clicks: clicks
  };
};
Elm.Native.Random = function(elm) {
  'use strict';
  elm.Native = elm.Native || {};
  if (elm.Native.Random) return elm.Native.Random;

  var Signal = Elm.Signal(elm);

  function range(min, max, signal) {
    function f(x) { return Math.floor(Math.random() * (max-min+1)) + min; }
    return A2( Signal.lift, f, signal );
  }

  function flt(signal) {
    function f(x) { return Math.random(); }
    return A2( Signal.lift, f, signal );
  }

  return elm.Native.Random = { range: F3(range), float: flt };

};

Elm.Native.Signal = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.Signal) return elm.Native.Signal;

  var Utils  = Elm.Native.Utils(elm);
  var foldl1 = Elm.List(elm).foldl1;

  function send(node, timestep, changed) {
    var kids = node.kids;
    for (var i = kids.length; i--; ) {
      kids[i].recv(timestep, changed, node.id);
    }
  }

  function Input(base) {
    this.id = Utils.guid();
    this.value = base;
    this.kids = [];
    this.defaultNumberOfKids = 0;
    this.recv = function(timestep, eid, v) {
      var changed = eid === this.id;
      if (changed) { this.value = v; }
      send(this, timestep, changed);
      return changed;
    };
    elm.inputs.push(this);
  }

  function LiftN(update, args) {
    this.id = Utils.guid();
    this.value = update();
    this.kids = [];

    var n = args.length;
    var count = 0;
    var isChanged = false;

    this.recv = function(timestep, changed, parentID) {
      ++count;
      if (changed) { isChanged = true; }
      if (count == n) {
        if (isChanged) { this.value = update(); }
        send(this, timestep, isChanged);
        isChanged = false;
        count = 0;
      }
    };
    for (var i = n; i--; ) { args[i].kids.push(this); }
  }

  function lift(func, a) {
    function update() { return func(a.value); }
    return new LiftN(update, [a]);
  }
  function lift2(func, a, b) {
    function update() { return A2( func, a.value, b.value ); }
    return new LiftN(update, [a,b]);
  }
  function lift3(func, a, b, c) {
    function update() { return A3( func, a.value, b.value, c.value ); }
    return new LiftN(update, [a,b,c]);
  }
  function lift4(func, a, b, c, d) {
    function update() { return A4( func, a.value, b.value, c.value, d.value ); }
    return new LiftN(update, [a,b,c,d]);
  }
  function lift5(func, a, b, c, d, e) {
    function update() { return A5( func, a.value, b.value, c.value, d.value, e.value ); }
    return new LiftN(update, [a,b,c,d,e]);
  }
  function lift6(func, a, b, c, d, e, f) {
    function update() { return A6( func, a.value, b.value, c.value, d.value, e.value, f.value ); }
    return new LiftN(update, [a,b,c,d,e,f]);
  }
  function lift7(func, a, b, c, d, e, f, g) {
    function update() { return A7( func, a.value, b.value, c.value, d.value, e.value, f.value, g.value ); }
    return new LiftN(update, [a,b,c,d,e,f,g]);
  }
  function lift8(func, a, b, c, d, e, f, g, h) {
    function update() { return A8( func, a.value, b.value, c.value, d.value, e.value, f.value, g.value, h.value ); }
    return new LiftN(update, [a,b,c,d,e,f,g,h]);
  }

  function foldp(func,state,input) {
    var first = true;
    function update() {
        first ? first = false : state = A2(func, input.value, state);
        return state;
    }
    return new LiftN(update, [input]);
  }

  function DropIf(pred,base,input) {
    this.id = Utils.guid();
    this.value = pred(input.value) ? base : input.value;
    this.kids = [];
    this.recv = function(timestep, changed, parentID) {
      var chng = changed && !pred(input.value);
      if (chng) { this.value = input.value; }
      send(this, timestep, chng);
    };
    input.kids.push(this);
  }

  function DropRepeats(input) {
    this.id = Utils.guid();
    this.value = input.value;
    this.kids = [];
    this.recv = function(timestep, changed, parentID) {
      var chng = changed && !Utils.eq(this.value,input.value);
      if (chng) { this.value = input.value; }
      send(this, timestep, chng);
    };
    input.kids.push(this);
  }

  function dropWhen(s1,b,s2) {
    var pairs = lift2( F2(function(x,y){return {x:x,y:y};}), s1, s2 );
    var dropped = new DropIf(function(p){return p.x;},{x:true,y:b},pairs);
    return lift(function(p){return p.y;}, dropped);
  }

  function timestamp(a) {
    function update() { return Utils.Tuple2(Date.now(), a.value); }
    return new LiftN(update, [a]);
  }

  function SampleOn(s1,s2) {
    this.id = Utils.guid();
    this.value = s2.value;
    this.kids = [];

    var count = 0;
    var isChanged = false;

    this.recv = function(timestep, changed, parentID) {
      if (parentID === s1.id) isChanged = changed;
      ++count;
      if (count == 2) {
        if (isChanged) { this.value = s2.value; }
        send(this, timestep, isChanged);
        count = 0;
        isChanged = false;
      }
    };
    s1.kids.push(this);
    s2.kids.push(this);
  }

  function sampleOn(s1,s2) { return new SampleOn(s1,s2); }

  function delay(t,s) {
      var delayed = new Input(s.value);
      var firstEvent = true;
      function update(v) {
        if (firstEvent) { firstEvent = false; return; }
        setTimeout(function() { elm.notify(delayed.id, v); }, t);
      }
      function first(a,b) { return a; }
      return new SampleOn(delayed, lift2(F2(first), delayed, lift(update,s)));
  }

  function Merge(s1,s2) {
      this.id = Utils.guid();
      this.value = s1.value;
      this.kids = [];

      var next = null;
      var count = 0;
      var isChanged = false;

      this.recv = function(timestep, changed, parentID) {
        ++count;
        if (changed) {
            isChanged = true;
            if (parentID == s2.id && next === null) { next = s2.value; }
            if (parentID == s1.id) { next = s1.value; }
        }

        if (count == 2) {
            if (isChanged) { this.value = next; next = null; }
            send(this, timestep, isChanged);
            isChanged = false;
            count = 0;
        }
      };
      s1.kids.push(this);
      s2.kids.push(this);
  }

  function merge(s1,s2) { return new Merge(s1,s2); }
  function merges(ss) { return A2(foldl1, F2(merge), ss); }

  return elm.Native.Signal = {
    constant : function(v) { return new Input(v); },
    lift  : F2(lift ),
    lift2 : F3(lift2),
    lift3 : F4(lift3),
    lift4 : F5(lift4),
    lift5 : F6(lift5),
    lift6 : F7(lift6),
    lift7 : F8(lift7),
    lift8 : F9(lift8),
    foldp : F3(foldp),
    delay : F2(delay),
    merge : F2(merge),
    merges : merges,
    count : function(s) { return foldp(F2(function(_,c) { return c+1; }), 0, s); },
    countIf : F2(function(pred,s) {
      return foldp(F2(function(x,c){
        return pred(x) ? c+1 : c; }), 0, s)}),
    keepIf : F3(function(pred,base,sig) {
      return new DropIf(function(x) {return !pred(x);},base,sig); }),
    dropIf : F3(function(pred,base,sig) { return new DropIf(pred,base,sig); }),
    keepWhen : F3(function(s1,b,s2) {
      return dropWhen(lift(function(b){return !b;},s1), b, s2); }),
    dropWhen : F3(dropWhen),
    dropRepeats : function(s) { return new DropRepeats(s);},
    sampleOn : F2(sampleOn),
    timestamp : timestamp
  };
};

Elm.Native.Time = function(elm) {
  'use strict';

  var Signal = Elm.Signal(elm);
  var Maybe = Elm.Maybe(elm);
  var Utils = Elm.Native.Utils(elm);

  function fpsWhen(desiredFPS, isOn) {
    var msPerFrame = 1000 / desiredFPS;
    var prev = Date.now(), curr = prev, diff = 0, wasOn = true;
    var ticker = Signal.constant(diff);
    function tick(zero) { return function() {
        curr = Date.now();
        diff = zero ? 0 : curr - prev;
        prev = curr;
        elm.notify(ticker.id, diff);
      };
    }
    var timeoutID = 0;
    function f(isOn, t) {
      if (isOn) {
        timeoutID = setTimeout(tick(!wasOn && isOn), msPerFrame);
      } else if (wasOn) {
        clearTimeout(timeoutID);
      }
      wasOn = isOn;
      return t;
    }
    return A3( Signal.lift2, F2(f), isOn, ticker );
  }

  function everyWhen(t, isOn) {
    var clock = Signal.constant(Date.now());
    function tellTime() { elm.notify(clock.id, Date.now()); }
    setInterval(tellTime, t);
    return clock;
  }

  function since(t, s) {
    function cmp(a,b) { return !Utils.eq(a,b); }
    var dcount = Signal.count(A2(Signal.delay, t, s));
    return A3( Signal.lift2, F2(cmp), Signal.count(s), dcount );
  }
  function read(s) {
      var t = Date.parse(s);
      return isNaN(t) ? Maybe.Nothing : Maybe.Just(t);
  }
  return elm.Native.Time = {
      fpsWhen : F2(fpsWhen),
      fps : function(t) { return fpsWhen(t, Signal.constant(true)); },
      every : function(t) { return everyWhen(t, Signal.constant(true)) },
      delay : Signal.delay,
      timestamp : Signal.timestamp,
      since : F2(since),
      toDate : function(t) { return new window.Date(t); },
      read   : read
  };

};

Elm.Native.Touch = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.Touch) return elm.Native.Touch;

  var Signal = Elm.Signal(elm);
  var JS = Elm.JavaScript(elm);
  var _ = Elm.Native.Utils(elm);

  function Dict() {
    this.keys = [];
    this.values = [];

    this.insert = function(key,value) {
      this.keys.push(key);
      this.values.push(value);
    };
    this.lookup = function(key) {
      var i = this.keys.indexOf(key)
      return i >= 0 ? this.values[i] : {x:0,y:0,t:0};
    };
    this.remove = function(key) {
      var i = this.keys.indexOf(key);
      if (i < 0) return;
      var t = this.values[i];
      this.keys.splice(i,1);
      this.values.splice(i,1);
      return t;
    };
    this.clear = function() {
        this.keys = [];
        this.values = [];
    };
  }
  
  var root = Signal.constant([]),
      tapTime = 500,
      hasTap = false,
      tap = {_:{},x:0,y:0},
      dict = new Dict();

  function touch(t) {
      var r = dict.lookup(t.identifier);
      return {_ : {},
	      id: t.identifier,
	      x : t.pageX - elm.node.offsetX,
	      y : t.pageY - elm.node.offsetY,
	      x0: r.x,
	      y0: r.y,
	      t0: r.t
	      };
  }

  var node = elm.display === ElmRuntime.Display.FULLSCREEN ? document : elm.node;

  function start(e) {
    dict.insert(e.identifier,
                {x: e.pageX - elm.node.offsetX,
                 y: e.pageY - elm.node.offsetY,
                 t: Date.now()});
  }
  function end(e) {
    var t = dict.remove(e.identifier);
    if (Date.now() - t.t < tapTime) {
        hasTap = true;
        tap = {_:{}, x:t.x, y:t.y};
    }
  }

  function listen(name, f) {
    function update(e) {
      for (var i = e.changedTouches.length; i--; ) { f(e.changedTouches[i]); }
      var ts = new Array(e.touches.length);
      for (var i = e.touches.length; i--; ) { ts[i] = touch(e.touches[i]); }
      var hasListener = elm.notify(root.id, ts);
      if (!hasListener) return node.removeEventListener(name, update);
      e.preventDefault();
    }
    node.addEventListener(name, update);
  }

  listen("touchstart", start);
  listen("touchmove", function(_){});
  listen("touchend", end);
  listen("touchcancel", end);
  listen("touchleave", end);

  var mouseID = -1;
  function move(e) {
      for (var i = root.value.length; i--; ) {
          if (root.value[i].id === mouseID) {
              root.value[i].x = e.pageX - elm.node.offsetX;
              root.value[i].y = e.pageY - elm.node.offsetY;
              elm.notify(root.id, root.value);
              break;
          }
      }
  }
  node.addEventListener("mousedown", function(e) {
          node.addEventListener("mousemove", move);
          e.identifier = mouseID;
          start(e);
          root.value.push(touch(e));
          elm.notify(root.id, root.value);
      });
  node.addEventListener("mouseup", function(e) {
          node.removeEventListener("mousemove", move);
          e.identifier = mouseID;
          end(e);
          for (var i = root.value.length; i--; ) {
              if (root.value[i].id === mouseID) {
                  root.value.splice(i, 1);
                  --mouseID;
                  break;
              }
          }
          elm.notify(root.id, root.value);
      });
  node.addEventListener("blur", function() {
          node.removeEventListener("mousemove", move);
          if (root.values.length > 0) {
              elm.notify(root.id, []);
              --mouseID;
          }
          dict.clear();
      });

  function dependency(f) {
      var sig = A2( Signal.lift, f, root );
      root.defaultNumberOfKids += 1;
      sig.defaultNumberOfKids = 0;
      return sig;
  }

  var touches = dependency(JS.toList);

  var taps = function() {
      var sig = dependency(function(_) { return tap; });
      sig.defaultNumberOfKids = 1;
      function pred(_) { var b = hasTap; hasTap = false; return b; }
      var sig2 = A3( Signal.keepIf, pred, {_:{},x:0,y:0}, sig);
      sig2.defaultNumberOfKids = 0;
      return sig2;
  }();

  return elm.Native.Touch = { touches: touches, taps: taps };

};
Elm.Native.WebSocket = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.WebSocket) return elm.Native.WebSocket;

  var Signal = Elm.Signal(elm);
  var JS = Elm.JavaScript(elm);
  var List = Elm.Native.List(elm);

  function open(url, outgoing) {
    var incoming = Signal.constant(List.Nil);
    var ws = new WebSocket(JS.fromString(url));

    var pending = [];
    var ready = false;
    
    ws.onopen = function(e) {
      var len = pending.length;
      for (var i = 0; i < len; ++i) { ws.send(pending[i]); }
      ready = true;
    };
    ws.onmessage = function(event) {
      elm.notify(incoming.id, JS.toString(event.data));
    };
    
    function send(msg) {
      var s = JS.fromString(msg);
      ready ? ws.send(s) : pending.push(s);
    }
    
    function take1(x,y) { return x }
    return A3(Signal.lift2, F2(take1), incoming, A2(Signal.lift, send, outgoing));
  }

  return elm.Native.WebSocket = { connect: F2(open) };
};

Elm.Native.Window = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  if (elm.Native.Window) return elm.Native.Window;

  var Signal = Elm.Signal(elm);
  var Tuple2 = Elm.Native.Utils(elm).Tuple2;

  function getWidth() { return elm.node.clientWidth; }
  function getHeight() {
      if (elm.display === ElmRuntime.Display.FULLSCREEN) {
          return window.innerHeight;
      }
      return elm.node.clientHeight;
  }

  var dimensions = Signal.constant(Tuple2(getWidth(), getHeight()));
  dimensions.defaultNumberOfKids = 2;

  // Do not move width and height into Elm. By setting the default number of kids,
  // the resize listener can be detached.
  var width  = A2(Signal.lift, function(p){return p._0;}, dimensions);
  width.defaultNumberOfKids = 0;

  var height = A2(Signal.lift, function(p){return p._1;}, dimensions);
  height.defaultNumberOfKids = 0;

  function resizeIfNeeded() {
      var w = getWidth();
      var h = getHeight();
      if (dimensions.value._0 === w && dimensions.value._1 === h) return;
      var hasListener = elm.notify(dimensions.id, Tuple2(w,h));
      if (!hasListener) window.removeEventListener('resize', resizeIfNeeded);
  }
  window.addEventListener('resize', resizeIfNeeded);

  return elm.Native.Window = {
      dimensions:dimensions,
      width:width,
      height:height,
      resizeIfNeeded:resizeIfNeeded
  };

};

Elm.Automaton = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var e, case0, run_1, step_16, step_2, _23000_26, f$_27, b_28, _24000_29, g$_30, c_31, combine_3, _34000_44, autos$_45, bs_46, pure_4, state_5, s$_56, hiddenState_6, _58000_60, s$_61, out_62, count_7, empty_8, enqueue_9, dequeue_10, average_11, step_79, stepFull_80, sum$_93;
 Step_0 = function(a1){
  return {ctor:"Step", _0:a1};};
 run_1 = F3(function(_14000_12, base_13, inputs_14){
  return (e=_14000_12.ctor==='Step'?(step_16 = F2(function(a_17, _13000_18){
   return (e=_13000_18.ctor==='Tuple2'?(e=_13000_18._0.ctor==='Step'?_13000_18._0._0(a_17):null,e!==null?e:null):null,e!==null?e:_E.Case('Line 13, Column 28'));}), A2(lift, snd, A3(foldp, step_16, base_13, inputs_14))):null,e!==null?e:_E.Case('Line 13, Column 3'));});
 step_2 = F2(function(a_20, _18000_21){
  return (e=_18000_21.ctor==='Step'?_18000_21._0(a_20):null,e!==null?e:_E.Case('Line 18, Column 19'));});
 
 $op['>>>'] = F2(function(f_23, g_24){
  return Step_0(function(a_25){
   return (_23000_26 = A2(step_2, a_25, f_23), f$_27 = (e=_23000_26.ctor==='Tuple2'?_23000_26._0:null,e!==null?e:_E.Case('Line 23, Column 29')), b_28 = (e=_23000_26.ctor==='Tuple2'?_23000_26._1:null,e!==null?e:_E.Case('Line 23, Column 29')), _24000_29 = A2(step_2, b_28, g_24), g$_30 = (e=_24000_29.ctor==='Tuple2'?_24000_29._0:null,e!==null?e:_E.Case('Line 24, Column 29')), c_31 = (e=_24000_29.ctor==='Tuple2'?_24000_29._1:null,e!==null?e:_E.Case('Line 24, Column 29')), {ctor:"Tuple2", _0:$op['>>>'](f$_27)(g$_30), _1:c_31});});});;
 
 $op['<<<'] = F2(function(g_40, f_41){
  return $op['>>>'](f_41)(g_40);});;
 combine_3 = function(autos_42){
  return Step_0(function(a_43){
   return (_34000_44 = unzip(A2(map, step_2(a_43), autos_42)), autos$_45 = (e=_34000_44.ctor==='Tuple2'?_34000_44._0:null,e!==null?e:_E.Case('Line 34, Column 34')), bs_46 = (e=_34000_44.ctor==='Tuple2'?_34000_44._1:null,e!==null?e:_E.Case('Line 34, Column 34')), {ctor:"Tuple2", _0:combine_3(autos$_45), _1:bs_46});});};
 pure_4 = function(f_51){
  return Step_0(function(x_52){
   return {ctor:"Tuple2", _0:pure_4(f_51), _1:f_51(x_52)};});};
 state_5 = F2(function(s_53, f_54){
  return Step_0(function(x_55){
   return (s$_56 = A2(f_54, x_55, s_53), {ctor:"Tuple2", _0:A2(state_5, s$_56, f_54), _1:s$_56});});});
 hiddenState_6 = F2(function(s_57, f_58){
  return Step_0(function(x_59){
   return (_58000_60 = A2(f_58, x_59, s_57), s$_61 = (e=_58000_60.ctor==='Tuple2'?_58000_60._0:null,e!==null?e:_E.Case('Line 58, Column 46')), out_62 = (e=_58000_60.ctor==='Tuple2'?_58000_60._1:null,e!==null?e:_E.Case('Line 58, Column 46')), {ctor:"Tuple2", _0:A2(hiddenState_6, s$_61, f_58), _1:out_62});});});
 enqueue_9 = F2(function(x_69, _67000_70){
  return (e=_67000_70.ctor==='Tuple2'?{ctor:"Tuple2", _0:_L.Cons(x_69,_67000_70._0), _1:_67000_70._1}:null,e!==null?e:_E.Case('Line 67, Column 22'));});
 dequeue_10 = function(q_73){
  return (e=q_73.ctor==='Tuple2'?(e=q_73._0.ctor==='Nil'?(e=q_73._1.ctor==='Nil'?Nothing:null,e!==null?e:null):null,e!==null?e:(e=q_73._1.ctor==='Cons'?Just({ctor:"Tuple2", _0:q_73._1._0, _1:{ctor:"Tuple2", _0:q_73._0, _1:q_73._1._1}}):q_73._1.ctor==='Nil'?enqueue_9({ctor:"Tuple2", _0:_L.Nil, _1:reverse(q_73._0)}):null,e!==null?e:null)):null,e!==null?e:_E.Case('Line 68, Column 13'));};
 average_11 = function(k_78){
  return (step_79 = F2(function(n_81, _78000_82){
   return (e=_78000_82.ctor==='Tuple3'?(_N.eq(_78000_82._1,k_78)?A2(stepFull_80, n_81, {ctor:"Tuple3", _0:_78000_82._0, _1:_78000_82._1, _2:_78000_82._2}):{ctor:"Tuple2", _0:{ctor:"Tuple3", _0:A2(enqueue_9, n_81, _78000_82._0), _1:(1+_78000_82._1), _2:(_78000_82._2+n_81)}, _1:((_78000_82._2+n_81)/(1+_78000_82._1))}):null,e!==null?e:_E.Case('Line 77, Column 11'));}), stepFull_80 = F2(function(n_86, _84000_87){
   return (e=_84000_87.ctor==='Tuple3'?(case48 = dequeue_10(_84000_87._0), (e=case48.ctor==='Just'?(e=case48._0.ctor==='Tuple2'?(sum$_93 = ((_84000_87._2+n_86)-case48._0._0), {ctor:"Tuple2", _0:{ctor:"Tuple3", _0:A2(enqueue_9, n_86, case48._0._1), _1:_84000_87._1, _2:sum$_93}, _1:(sum$_93/_84000_87._1)}):null,e!==null?e:null):case48.ctor==='Nothing'?{ctor:"Tuple2", _0:{ctor:"Tuple3", _0:_84000_87._0, _1:_84000_87._1, _2:_84000_87._2}, _1:0}:null,e!==null?e:_E.Case('Line 80, Column 11'))):null,e!==null?e:_E.Case('Line 80, Column 11'));}), A2(hiddenState_6, {ctor:"Tuple3", _0:empty_8, _1:0, _2:0}, step_79));};
 count_7 = A2(state_5, 0, function(__67){
  return function(c_68){
   return (1+c_68);};});
 empty_8 = {ctor:"Tuple2", _0:_L.Nil, _1:_L.Nil};
 elm.Native = elm.Native||{};
 var _ = elm.Native.Automaton||{};
 _.$op = {'>>>' : $op['>>>'], '<<<' : $op['<<<']};
 _.Step = Step_0;
 _.run = run_1;
 _.step = step_2;
 _.combine = combine_3;
 _.pure = pure_4;
 _.state = state_5;
 _.hiddenState = hiddenState_6;
 _.count = count_7;
 _.empty = empty_8;
 _.enqueue = enqueue_9;
 _.dequeue = dequeue_10;
 _.average = average_11
 return elm.Automaton = _;
 };
Elm.Char = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var N = Elm.Native.Char(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Char||{};
 _.$op = {}
 return elm.Char = _;
 };
Elm.Color = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var e, case0, rgba_1, rgb_2, red_3, lime_4, blue_5, yellow_6, cyan_7, magenta_8, black_9, white_10, gray_11, grey_12, maroon_13, navy_14, green_15, teal_16, purple_17, violet_18, forestGreen_19, linear_22, radial_23;
 Color_0 = F4(function(a1, a2, a3, a4){
  return {ctor:"Color", _0:a1, _1:a2, _2:a3, _3:a4};});
 Linear_20 = F3(function(a1, a2, a3){
  return {ctor:"Linear", _0:a1, _1:a2, _2:a3};});
 Radial_21 = F5(function(a1, a2, a3, a4, a5){
  return {ctor:"Radial", _0:a1, _1:a2, _2:a3, _3:a4, _4:a5};});
 rgb_2 = F3(function(r_24, g_25, b_26){
  return A4(Color_0, r_24, g_25, b_26, 1);});
 rgba_1 = Color_0;
 red_3 = A4(Color_0, 255, 0, 0, 1);
 lime_4 = A4(Color_0, 0, 255, 0, 1);
 blue_5 = A4(Color_0, 0, 0, 255, 1);
 yellow_6 = A4(Color_0, 255, 255, 0, 1);
 cyan_7 = A4(Color_0, 0, 255, 255, 1);
 magenta_8 = A4(Color_0, 255, 0, 255, 1);
 black_9 = A4(Color_0, 0, 0, 0, 1);
 white_10 = A4(Color_0, 255, 255, 255, 1);
 gray_11 = A4(Color_0, 128, 128, 128, 1);
 grey_12 = A4(Color_0, 128, 128, 128, 1);
 maroon_13 = A4(Color_0, 128, 0, 0, 1);
 navy_14 = A4(Color_0, 0, 0, 128, 1);
 green_15 = A4(Color_0, 0, 128, 0, 1);
 teal_16 = A4(Color_0, 0, 128, 128, 1);
 purple_17 = A4(Color_0, 128, 0, 128, 1);
 violet_18 = A4(Color_0, 238, 130, 238, 1);
 forestGreen_19 = A4(Color_0, 34, 139, 34, 1);
 linear_22 = Linear_20;
 radial_23 = Radial_21;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Color||{};
 _.$op = {};
 _.Color = Color_0;
 _.rgba = rgba_1;
 _.rgb = rgb_2;
 _.red = red_3;
 _.lime = lime_4;
 _.blue = blue_5;
 _.yellow = yellow_6;
 _.cyan = cyan_7;
 _.magenta = magenta_8;
 _.black = black_9;
 _.white = white_10;
 _.gray = gray_11;
 _.grey = grey_12;
 _.maroon = maroon_13;
 _.navy = navy_14;
 _.green = green_15;
 _.teal = teal_16;
 _.purple = purple_17;
 _.violet = violet_18;
 _.forestGreen = forestGreen_19;
 _.Linear = Linear_20;
 _.Radial = Radial_21;
 _.linear = linear_22;
 _.radial = radial_23
 return elm.Color = _;
 };
Elm.Date = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var e, case0;
 Mon_0 = {ctor:"Mon"};
 Tue_1 = {ctor:"Tue"};
 Wed_2 = {ctor:"Wed"};
 Thu_3 = {ctor:"Thu"};
 Fri_4 = {ctor:"Fri"};
 Sat_5 = {ctor:"Sat"};
 Sun_6 = {ctor:"Sun"};
 Jan_7 = {ctor:"Jan"};
 Feb_8 = {ctor:"Feb"};
 Mar_9 = {ctor:"Mar"};
 Apr_10 = {ctor:"Apr"};
 May_11 = {ctor:"May"};
 Jun_12 = {ctor:"Jun"};
 Jul_13 = {ctor:"Jul"};
 Aug_14 = {ctor:"Aug"};
 Sep_15 = {ctor:"Sep"};
 Oct_16 = {ctor:"Oct"};
 Nov_17 = {ctor:"Nov"};
 Dec_18 = {ctor:"Dec"};
 elm.Native = elm.Native||{};
 var _ = elm.Native.Date||{};
 _.$op = {};
 _.Mon = Mon_0;
 _.Tue = Tue_1;
 _.Wed = Wed_2;
 _.Thu = Thu_3;
 _.Fri = Fri_4;
 _.Sat = Sat_5;
 _.Sun = Sun_6;
 _.Jan = Jan_7;
 _.Feb = Feb_8;
 _.Mar = Mar_9;
 _.Apr = Apr_10;
 _.May = May_11;
 _.Jun = Jun_12;
 _.Jul = Jul_13;
 _.Aug = Aug_14;
 _.Sep = Sep_15;
 _.Oct = Oct_16;
 _.Nov = Nov_17;
 _.Dec = Dec_18
 return elm.Date = _;
 };
Elm.Dict = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var Maybe = Elm.Maybe(elm);
 var Error = Elm.Native.Error(elm);
 var List = Elm.List(elm);
 var _ = Elm.Native.Utils(elm); var Native = Native||{};Native.Utils = _;
 var compare = _.compare;
 var e, case0, empty_4, min_5, lookup_6, findWithDefault_7, member_8, rotateLeft_9, rotateRight_10, rotateLeftIfNeeded_11, rotateRightIfNeeded_12, otherColor_13, color_flip_14, color_flipIfNeeded_15, fixUp_16, ensureBlackRoot_17, insert_18, ins_107, h_114, singleton_19, isRed_20, isRedLeft_21, isRedLeftLeft_22, isRedRight_23, isRedRightLeft_24, moveRedLeft_25, t$_123, moveRedRight_26, t$_130, moveRedLeftIfNeeded_27, moveRedRightIfNeeded_28, deleteMin_29, del_134, remove_30, eq_and_noRightNode_143, eq_144, delLT_145, delEQ_146, _325000_163, k$_164, v$_165, delGT_147, del_148, u_178, t$_179, map_31, foldl_32, foldr_33, union_34, intersect_35, combine_205, diff_36, keys_37, values_38, toList_39, fromList_40;
 Red_0 = {ctor:"Red"};
 Black_1 = {ctor:"Black"};
 RBNode_2 = F5(function(a1, a2, a3, a4, a5){
  return {ctor:"RBNode", _0:a1, _1:a2, _2:a3, _3:a4, _4:a5};});
 RBEmpty_3 = {ctor:"RBEmpty"};
 min_5 = function(t_41){
  return (e=t_41.ctor==='RBEmpty'?Error.raise(_str('(min Empty) is not defined')):t_41.ctor==='RBNode'?(e=t_41._3.ctor==='RBEmpty'?{ctor:"Tuple2", _0:t_41._1, _1:t_41._2}:null,e!==null?e:min_5(t_41._3)):null,e!==null?e:_E.Case('Line 104, Column 3'));};
 lookup_6 = F2(function(k_45, t_46){
  return (e=t_46.ctor==='RBEmpty'?Maybe.Nothing:t_46.ctor==='RBNode'?(case12 = A2(compare, k_45, t_46._1), (e=case12.ctor==='EQ'?Maybe.Just(t_46._2):case12.ctor==='GT'?A2(lookup_6, k_45, t_46._4):case12.ctor==='LT'?A2(lookup_6, k_45, t_46._3):null,e!==null?e:_E.Case('Line 124, Column 5'))):null,e!==null?e:_E.Case('Line 121, Column 2'));});
 findWithDefault_7 = F3(function(base_51, k_52, t_53){
  return (e=t_53.ctor==='RBEmpty'?base_51:t_53.ctor==='RBNode'?(case19 = A2(compare, k_52, t_53._1), (e=case19.ctor==='EQ'?t_53._2:case19.ctor==='GT'?A3(findWithDefault_7, base_51, k_52, t_53._4):case19.ctor==='LT'?A3(findWithDefault_7, base_51, k_52, t_53._3):null,e!==null?e:_E.Case('Line 136, Column 5'))):null,e!==null?e:_E.Case('Line 133, Column 2'));});
 member_8 = F2(function(k_58, t_59){
  return Maybe.isJust(A2(lookup_6, k_58, t_59));});
 rotateLeft_9 = function(t_60){
  return (e=t_60.ctor==='RBNode'?(e=t_60._4.ctor==='RBNode'?A5(RBNode_2, t_60._0, t_60._4._1, t_60._4._2, A5(RBNode_2, Red_0, t_60._1, t_60._2, t_60._3, t_60._4._3), t_60._4._4):null,e!==null?e:null):null,e!==null?e:Error.raise(_str('rotateLeft of a node without enough children')));};
 rotateRight_10 = function(t_70){
  return (e=t_70.ctor==='RBNode'?(e=t_70._3.ctor==='RBNode'?A5(RBNode_2, t_70._0, t_70._3._1, t_70._3._2, t_70._3._3, A5(RBNode_2, Red_0, t_70._1, t_70._2, t_70._3._4, t_70._4)):null,e!==null?e:null):null,e!==null?e:Error.raise(_str('rotateRight of a node without enough children')));};
 rotateLeftIfNeeded_11 = function(t_80){
  return (e=t_80.ctor==='RBNode'?(e=t_80._4.ctor==='RBNode'?(e=t_80._4._0.ctor==='Red'?rotateLeft_9(t_80):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:t_80);};
 rotateRightIfNeeded_12 = function(t_81){
  return (e=t_81.ctor==='RBNode'?(e=t_81._3.ctor==='RBNode'?(e=t_81._3._0.ctor==='Red'?(e=t_81._3._3.ctor==='RBNode'?(e=t_81._3._3._0.ctor==='Red'?rotateRight_10(t_81):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:t_81);};
 otherColor_13 = function(c_82){
  return (e=c_82.ctor==='Black'?Red_0:c_82.ctor==='Red'?Black_1:null,e!==null?e:_E.Case('Line 185, Column 16'));};
 color_flip_14 = function(t_83){
  return (e=t_83.ctor==='RBNode'?(e=t_83._3.ctor==='RBNode'?(e=t_83._4.ctor==='RBNode'?A5(RBNode_2, otherColor_13(t_83._0), t_83._1, t_83._2, A5(RBNode_2, otherColor_13(t_83._3._0), t_83._3._1, t_83._3._2, t_83._3._3, t_83._3._4), A5(RBNode_2, otherColor_13(t_83._4._0), t_83._4._1, t_83._4._2, t_83._4._3, t_83._4._4)):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:Error.raise(_str('color_flip called on a Empty or Node with a Empty child')));};
 color_flipIfNeeded_15 = function(t_97){
  return (e=t_97.ctor==='RBNode'?(e=t_97._3.ctor==='RBNode'?(e=t_97._3._0.ctor==='Red'?(e=t_97._4.ctor==='RBNode'?(e=t_97._4._0.ctor==='Red'?color_flip_14(t_97):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:t_97);};
 fixUp_16 = function(t_98){
  return color_flipIfNeeded_15(rotateRightIfNeeded_12(rotateLeftIfNeeded_11(t_98)));};
 ensureBlackRoot_17 = function(t_99){
  return (e=t_99.ctor==='RBNode'?(e=t_99._0.ctor==='Red'?A5(RBNode_2, Black_1, t_99._1, t_99._2, t_99._3, t_99._4):null,e!==null?e:null):null,e!==null?e:t_99);};
 insert_18 = F3(function(k_104, v_105, t_106){
  return (ins_107 = function(t_108){
   return (e=t_108.ctor==='RBEmpty'?A5(RBNode_2, Red_0, k_104, v_105, RBEmpty_3, RBEmpty_3):t_108.ctor==='RBNode'?(h_114 = (case114 = A2(compare, k_104, t_108._1), (e=case114.ctor==='EQ'?A5(RBNode_2, t_108._0, t_108._1, v_105, t_108._3, t_108._4):case114.ctor==='GT'?A5(RBNode_2, t_108._0, t_108._1, t_108._2, t_108._3, ins_107(t_108._4)):case114.ctor==='LT'?A5(RBNode_2, t_108._0, t_108._1, t_108._2, ins_107(t_108._3), t_108._4):null,e!==null?e:_E.Case('Line 218, Column 19'))), fixUp_16(h_114)):null,e!==null?e:_E.Case('Line 215, Column 7'));}, ensureBlackRoot_17(ins_107(t_106)));});
 singleton_19 = F2(function(k_115, v_116){
  return A3(insert_18, k_115, v_116, RBEmpty_3);});
 isRed_20 = function(t_117){
  return (e=t_117.ctor==='RBNode'?(e=t_117._0.ctor==='Red'?true:null,e!==null?e:null):null,e!==null?e:false);};
 isRedLeft_21 = function(t_118){
  return (e=t_118.ctor==='RBNode'?(e=t_118._3.ctor==='RBNode'?(e=t_118._3._0.ctor==='Red'?true:null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:false);};
 isRedLeftLeft_22 = function(t_119){
  return (e=t_119.ctor==='RBNode'?(e=t_119._3.ctor==='RBNode'?(e=t_119._3._3.ctor==='RBNode'?(e=t_119._3._3._0.ctor==='Red'?true:null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:false);};
 isRedRight_23 = function(t_120){
  return (e=t_120.ctor==='RBNode'?(e=t_120._4.ctor==='RBNode'?(e=t_120._4._0.ctor==='Red'?true:null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:false);};
 isRedRightLeft_24 = function(t_121){
  return (e=t_121.ctor==='RBNode'?(e=t_121._4.ctor==='RBNode'?(e=t_121._4._3.ctor==='RBNode'?(e=t_121._4._3._0.ctor==='Red'?true:null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:false);};
 moveRedLeft_25 = function(t_122){
  return (t$_123 = color_flip_14(t_122), (e=t$_123.ctor==='RBNode'?(e=t$_123._4.ctor==='RBNode'?(e=t$_123._4._3.ctor==='RBNode'?(e=t$_123._4._3._0.ctor==='Red'?color_flip_14(rotateLeft_9(A5(RBNode_2, t$_123._0, t$_123._1, t$_123._2, t$_123._3, rotateRight_10(t$_123._4)))):null,e!==null?e:null):null,e!==null?e:null):null,e!==null?e:t$_123):null,e!==null?e:t$_123));};
 moveRedRight_26 = function(t_129){
  return (t$_130 = color_flip_14(t_129), (isRedLeftLeft_22(t$_130)?color_flip_14(rotateRight_10(t$_130)):t$_130));};
 moveRedLeftIfNeeded_27 = function(t_131){
  return ((isRedLeft_21(t_131)||isRedLeftLeft_22(t_131))?t_131:moveRedLeft_25(t_131));};
 moveRedRightIfNeeded_28 = function(t_132){
  return ((isRedRight_23(t_132)||isRedRightLeft_24(t_132))?t_132:moveRedRight_26(t_132));};
 deleteMin_29 = function(t_133){
  return (del_134 = function(t_135){
   return (e=t_135.ctor==='RBNode'?(e=t_135._3.ctor==='RBEmpty'?RBEmpty_3:null,e!==null?e:null):null,e!==null?e:(case198 = moveRedLeftIfNeeded_27(t_135), (e=case198.ctor==='RBEmpty'?RBEmpty_3:case198.ctor==='RBNode'?fixUp_16(A5(RBNode_2, case198._0, case198._1, case198._2, del_134(case198._3), case198._4)):null,e!==null?e:_E.Case('Line 296, Column 12'))));}, ensureBlackRoot_17(del_134(t_133)));};
 remove_30 = F2(function(k_141, t_142){
  return (eq_and_noRightNode_143 = function(t_149){
   return (e=t_149.ctor==='RBNode'?(e=t_149._4.ctor==='RBEmpty'?_N.eq(k_141,t_149._1):null,e!==null?e:null):null,e!==null?e:false);}, eq_144 = function(t_151){
   return (e=t_151.ctor==='RBNode'?_N.eq(k_141,t_151._1):null,e!==null?e:false);}, delLT_145 = function(t_153){
   return (case216 = moveRedLeftIfNeeded_27(t_153), (e=case216.ctor==='RBEmpty'?Error.raise(_str('delLT on Empty')):case216.ctor==='RBNode'?fixUp_16(A5(RBNode_2, case216._0, case216._1, case216._2, del_148(case216._3), case216._4)):null,e!==null?e:_E.Case('Line 321, Column 17')));}, delEQ_146 = function(t_159){
   return (e=t_159.ctor==='RBEmpty'?Error.raise(_str('delEQ called on a Empty')):t_159.ctor==='RBNode'?(_325000_163 = min_5(t_159._4), k$_164 = (e=_325000_163.ctor==='Tuple2'?_325000_163._0:null,e!==null?e:_E.Case('Line 325, Column 53')), v$_165 = (e=_325000_163.ctor==='Tuple2'?_325000_163._1:null,e!==null?e:_E.Case('Line 325, Column 53')), fixUp_16(A5(RBNode_2, t_159._0, k$_164, v$_165, t_159._3, deleteMin_29(t_159._4)))):null,e!==null?e:_E.Case('Line 324, Column 17'));}, delGT_147 = function(t_170){
   return (e=t_170.ctor==='RBEmpty'?Error.raise(_str('delGT called on a Empty')):t_170.ctor==='RBNode'?fixUp_16(A5(RBNode_2, t_170._0, t_170._1, t_170._2, t_170._3, del_148(t_170._4))):null,e!==null?e:_E.Case('Line 328, Column 17'));}, del_148 = function(t_176){
   return (e=t_176.ctor==='RBEmpty'?RBEmpty_3:t_176.ctor==='RBNode'?((_N.cmp(k_141,t_176._1).ctor==='LT')?delLT_145(t_176):(u_178 = (isRedLeft_21(t_176)?rotateRight_10(t_176):t_176), (eq_and_noRightNode_143(u_178)?RBEmpty_3:(t$_179 = moveRedRightIfNeeded_28(t_176), (eq_144(t$_179)?delEQ_146(t$_179):delGT_147(t$_179)))))):null,e!==null?e:_E.Case('Line 331, Column 15'));}, (A2(member_8, k_141, t_142)?ensureBlackRoot_17(del_148(t_142)):t_142));});
 map_31 = F2(function(f_180, t_181){
  return (e=t_181.ctor==='RBEmpty'?RBEmpty_3:t_181.ctor==='RBNode'?A5(RBNode_2, t_181._0, t_181._1, f_180(t_181._2), A2(map_31, f_180, t_181._3), A2(map_31, f_180, t_181._4)):null,e!==null?e:_E.Case('Line 351, Column 3'));});
 foldl_32 = F3(function(f_187, acc_188, t_189){
  return (e=t_189.ctor==='RBEmpty'?acc_188:t_189.ctor==='RBNode'?A3(foldl_32, f_187, A3(f_187, t_189._1, t_189._2, A3(foldl_32, f_187, acc_188, t_189._3)), t_189._4):null,e!==null?e:_E.Case('Line 359, Column 3'));});
 foldr_33 = F3(function(f_194, acc_195, t_196){
  return (e=t_196.ctor==='RBEmpty'?acc_195:t_196.ctor==='RBNode'?A3(foldr_33, f_194, A3(f_194, t_196._1, t_196._2, A3(foldr_33, f_194, acc_195, t_196._4)), t_196._3):null,e!==null?e:_E.Case('Line 367, Column 3'));});
 union_34 = F2(function(t1_201, t2_202){
  return A3(foldl_32, insert_18, t2_202, t1_201);});
 intersect_35 = F2(function(t1_203, t2_204){
  return (combine_205 = F3(function(k_206, v_207, t_208){
   return (A2(member_8, k_206, t2_204)?A3(insert_18, k_206, v_207, t_208):t_208);}), A3(foldl_32, combine_205, empty_4, t1_203));});
 diff_36 = F2(function(t1_209, t2_210){
  return A3(foldl_32, function(k_211){
   return function(v_212){
    return function(t_213){
     return A2(remove_30, k_211, t_213);};};}, t1_209, t2_210);});
 keys_37 = function(t_214){
  return A3(foldr_33, function(k_215){
   return function(v_216){
    return function(acc_217){
     return _L.Cons(k_215,acc_217);};};}, _L.Nil, t_214);};
 values_38 = function(t_218){
  return A3(foldr_33, function(k_219){
   return function(v_220){
    return function(acc_221){
     return _L.Cons(v_220,acc_221);};};}, _L.Nil, t_218);};
 toList_39 = function(t_222){
  return A3(foldr_33, function(k_223){
   return function(v_224){
    return function(acc_225){
     return _L.Cons({ctor:"Tuple2", _0:k_223, _1:v_224},acc_225);};};}, _L.Nil, t_222);};
 fromList_40 = function(assocs_226){
  return A3(List.foldl, function(_0_227){
   return (e=_0_227.ctor==='Tuple2'?function(d_230){
    return A3(insert_18, _0_227._0, _0_227._1, d_230);}:null,e!==null?e:_E.Case('Line 402, Column 43'));}, empty_4, assocs_226);};
 empty_4 = RBEmpty_3;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Dict||{};
 _.$op = {};
 _.empty = empty_4;
 _.lookup = lookup_6;
 _.findWithDefault = findWithDefault_7;
 _.member = member_8;
 _.insert = insert_18;
 _.singleton = singleton_19;
 _.remove = remove_30;
 _.map = map_31;
 _.foldl = foldl_32;
 _.foldr = foldr_33;
 _.union = union_34;
 _.intersect = intersect_35;
 _.diff = diff_36;
 _.keys = keys_37;
 _.values = values_38;
 _.toList = toList_39;
 _.fromList = fromList_40
 return elm.Dict = _;
 };
Elm.Either = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.List(elm); var List = _;
 var e, case0, either_2, isLeft_3, isRight_4, lefts_5, rights_6, partition_7, consLeft_8, consRight_9, consEither_10;
 Left_0 = function(a1){
  return {ctor:"Left", _0:a1};};
 Right_1 = function(a1){
  return {ctor:"Right", _0:a1};};
 either_2 = F3(function(f_11, g_12, e_13){
  return (e=e_13.ctor==='Left'?f_11(e_13._0):e_13.ctor==='Right'?g_12(e_13._0):null,e!==null?e:_E.Case('Line 15, Column 16'));});
 isLeft_3 = function(e_16){
  return (e=e_16.ctor==='Left'?true:null,e!==null?e:false);};
 isRight_4 = function(e_17){
  return (e=e_17.ctor==='Right'?true:null,e!==null?e:false);};
 lefts_5 = function(es_18){
  return A3(List.foldr, consLeft_8, _L.Nil, es_18);};
 rights_6 = function(es_19){
  return A3(List.foldr, consRight_9, _L.Nil, es_19);};
 partition_7 = function(es_20){
  return A3(List.foldr, consEither_10, {ctor:"Tuple2", _0:_L.Nil, _1:_L.Nil}, es_20);};
 consLeft_8 = F2(function(e_21, vs_22){
  return (e=e_21.ctor==='Left'?_L.Cons(e_21._0,vs_22):e_21.ctor==='Right'?vs_22:null,e!==null?e:_E.Case('Line 39, Column 5'));});
 consRight_9 = F2(function(e_24, vs_25){
  return (e=e_24.ctor==='Left'?vs_25:e_24.ctor==='Right'?_L.Cons(e_24._0,vs_25):null,e!==null?e:_E.Case('Line 44, Column 5'));});
 consEither_10 = F2(function(e_27, _51000_28){
  return (e=_51000_28.ctor==='Tuple2'?(e=e_27.ctor==='Left'?{ctor:"Tuple2", _0:_L.Cons(e_27._0,_51000_28._0), _1:_51000_28._1}:e_27.ctor==='Right'?{ctor:"Tuple2", _0:_51000_28._0, _1:_L.Cons(e_27._0,_51000_28._1)}:null,e!==null?e:_E.Case('Line 49, Column 5')):null,e!==null?e:_E.Case('Line 49, Column 5'));});
 elm.Native = elm.Native||{};
 var _ = elm.Native.Either||{};
 _.$op = {};
 _.Left = Left_0;
 _.Right = Right_1;
 _.either = either_2;
 _.isLeft = isLeft_3;
 _.isRight = isRight_4;
 _.lefts = lefts_5;
 _.rights = rights_6;
 _.partition = partition_7;
 _.consLeft = consLeft_8;
 _.consRight = consRight_9;
 _.consEither = consEither_10
 return elm.Either = _;
 };
Elm.Http = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.Native.Http(elm); var Native = Native||{};Native.Http = _;
 var send = _.send;
 var _ = Elm.Signal(elm); var Signal = _;
 var lift = _.lift;
 var e, case0, Request_3, request_4, get_5, post_6, sendGet_7;
 Success_0 = function(a1){
  return {ctor:"Success", _0:a1};};
 Waiting_1 = {ctor:"Waiting"};
 Failure_2 = F2(function(a1, a2){
  return {ctor:"Failure", _0:a1, _1:a2};});
 Request_3 = F4(function(verb_8, url_9, body_10, headers_11){
  return {
    _:{
    },
    body:body_10,
    headers:headers_11,
    url:url_9,
    verb:verb_8};});
 get_5 = function(url_12){
  return A4(Request_3, _str('GET'), url_12, _str(''), _L.Nil);};
 post_6 = F2(function(url_13, body_14){
  return A4(Request_3, _str('POST'), url_13, body_14, _L.Nil);});
 sendGet_7 = function(reqs_15){
  return send(A2(lift, get_5, reqs_15));};
 request_4 = Request_3;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Http||{};
 _.$op = {};
 _.Success = Success_0;
 _.Waiting = Waiting_1;
 _.Failure = Failure_2;
 _.Request = Request_3;
 _.request = request_4;
 _.get = get_5;
 _.post = post_6;
 _.sendGet = sendGet_7
 return elm.Http = _;
 };
Elm.JavaScript = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.JavaScript||{};
 _.$op = {}
 return elm.JavaScript = _;
 };
Elm.Json = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var Dict = Elm.Dict(elm);
 var JS = Elm.JavaScript(elm);
 var Native = Elm.Native.Json(elm);
 var e, case0, toString_6, fromString_7;
 String_0 = function(a1){
  return {ctor:"String", _0:a1};};
 Number_1 = function(a1){
  return {ctor:"Number", _0:a1};};
 Boolean_2 = function(a1){
  return {ctor:"Boolean", _0:a1};};
 Null_3 = {ctor:"Null"};
 Array_4 = function(a1){
  return {ctor:"Array", _0:a1};};
 Object_5 = function(a1){
  return {ctor:"Object", _0:a1};};
 toString_6 = F2(function(sep_8, v_9){
  return JS.toString(A2(Native.toJSString, sep_8, v_9));});
 fromString_7 = function(s_10){
  return Native.fromJSString(JS.fromString(s_10));};
 elm.Native = elm.Native||{};
 var _ = elm.Native.Json||{};
 _.$op = {};
 _.String = String_0;
 _.Number = Number_1;
 _.Boolean = Boolean_2;
 _.Null = Null_3;
 _.Array = Array_4;
 _.Object = Object_5;
 _.toString = toString_6;
 _.fromString = fromString_7
 return elm.Json = _;
 };
Elm.Keyboard = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var N = Elm.Native.Keyboard(elm);
 var e, case0, arrows_0, wasd_1, shift_2, ctrl_3, space_4, enter_5;
 arrows_0 = A4(N.directions, 38, 40, 37, 39);
 wasd_1 = A4(N.directions, 87, 83, 65, 68);
 shift_2 = N.isDown(16);
 ctrl_3 = N.isDown(17);
 space_4 = N.isDown(32);
 enter_5 = N.isDown(13);
 elm.Native = elm.Native||{};
 var _ = elm.Native.Keyboard||{};
 _.$op = {};
 _.arrows = arrows_0;
 _.wasd = wasd_1;
 _.shift = shift_2;
 _.ctrl = ctrl_3;
 _.space = space_4;
 _.enter = enter_5
 return elm.Keyboard = _;
 };
Elm.List = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.Native.Utils(elm); var Native = Native||{};Native.Utils = _;
 var min = _.min, max = _.max;
 var L = Elm.Native.List(elm);
 var e, case0, concatMap_0, sum_1, product_2, maximum_3, minimum_4, partition_5, _106000_17, bs_18, cs_19, unzip_6, _127000_28, xs_29, ys_30, intersperse_7;
 concatMap_0 = function(f_8){
  return function(x){
   return L.concat(A2(L.map, f_8, x));};};
 partition_5 = F2(function(pred_13, lst_14){
  return (e=lst_14.ctor==='Cons'?(_106000_17 = A2(partition_5, pred_13, lst_14._1), bs_18 = (e=_106000_17.ctor==='Tuple2'?_106000_17._0:null,e!==null?e:_E.Case('Line 106, Column 30')), cs_19 = (e=_106000_17.ctor==='Tuple2'?_106000_17._1:null,e!==null?e:_E.Case('Line 106, Column 30')), (pred_13(lst_14._0)?{ctor:"Tuple2", _0:_L.Cons(lst_14._0,bs_18), _1:cs_19}:{ctor:"Tuple2", _0:bs_18, _1:_L.Cons(lst_14._0,cs_19)})):lst_14.ctor==='Nil'?{ctor:"Tuple2", _0:_L.Nil, _1:_L.Nil}:null,e!==null?e:_E.Case('Line 104, Column 5'));});
 unzip_6 = function(pairs_24){
  return (e=pairs_24.ctor==='Cons'?(e=pairs_24._0.ctor==='Tuple2'?(_127000_28 = unzip_6(pairs_24._1), xs_29 = (e=_127000_28.ctor==='Tuple2'?_127000_28._0:null,e!==null?e:_E.Case('Line 127, Column 33')), ys_30 = (e=_127000_28.ctor==='Tuple2'?_127000_28._1:null,e!==null?e:_E.Case('Line 127, Column 33')), {ctor:"Tuple2", _0:_L.Cons(pairs_24._0._0,xs_29), _1:_L.Cons(pairs_24._0._1,ys_30)}):null,e!==null?e:null):pairs_24.ctor==='Nil'?{ctor:"Tuple2", _0:_L.Nil, _1:_L.Nil}:null,e!==null?e:_E.Case('Line 125, Column 3'));};
 intersperse_7 = F2(function(sep_35, xs_36){
  return (e=xs_36.ctor==='Cons'?(e=xs_36._1.ctor==='Cons'?_L.Cons(xs_36._0,_L.Cons(sep_35,A2(intersperse_7, sep_35, _L.Cons(xs_36._1._0,xs_36._1._1)))):xs_36._1.ctor==='Nil'?_L.Cons(xs_36._0,_L.Nil):null,e!==null?e:null):xs_36.ctor==='Nil'?_L.Nil:null,e!==null?e:_E.Case('Line 145, Column 3'));});
 sum_1 = A2(L.foldl, function(x_9){
  return function(y_10){
   return (x_9+y_10);};}, 0);
 product_2 = A2(L.foldl, function(x_11){
  return function(y_12){
   return (x_11*y_12);};}, 1);
 maximum_3 = L.foldl1(max);
 minimum_4 = L.foldl1(min);
 elm.Native = elm.Native||{};
 var _ = elm.Native.List||{};
 _.$op = {};
 _.concatMap = concatMap_0;
 _.sum = sum_1;
 _.product = product_2;
 _.maximum = maximum_3;
 _.minimum = minimum_4;
 _.partition = partition_5;
 _.unzip = unzip_6;
 _.intersperse = intersperse_7
 return elm.List = _;
 };
Elm.Matrix2D = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var M = Elm.Native.Matrix2D(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Matrix2D||{};
 _.$op = {}
 return elm.Matrix2D = _;
 };
Elm.Maybe = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var List = Elm.List(elm);
 var e, case0, maybe_2, isJust_3, isNothing_4, cons_5, justs_6;
 Just_0 = function(a1){
  return {ctor:"Just", _0:a1};};
 Nothing_1 = {ctor:"Nothing"};
 maybe_2 = F3(function(b_7, f_8, m_9){
  return (e=m_9.ctor==='Just'?f_8(m_9._0):m_9.ctor==='Nothing'?b_7:null,e!==null?e:_E.Case('Line 13, Column 15'));});
 cons_5 = F2(function(mx_12, xs_13){
  return A3(maybe_2, xs_13, function(x_14){
   return _L.Cons(x_14,xs_13);}, mx_12);});
 isJust_3 = A2(maybe_2, false, function(__11){
  return true;});
 isNothing_4 = function(x){
  return not(isJust_3(x));};
 justs_6 = A2(List.foldr, cons_5, _L.Nil);
 elm.Native = elm.Native||{};
 var _ = elm.Native.Maybe||{};
 _.$op = {};
 _.Just = Just_0;
 _.Nothing = Nothing_1;
 _.maybe = maybe_2;
 _.isJust = isJust_3;
 _.isNothing = isNothing_4;
 _.cons = cons_5;
 _.justs = justs_6
 return elm.Maybe = _;
 };
Elm.Mouse = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var M = Elm.Native.Mouse(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Mouse||{};
 _.$op = {}
 return elm.Mouse = _;
 };
Elm.Prelude = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var N = Elm.Native.Prelude(elm);
 var e, case0, radians_0, degrees_1, turns_2, fromPolar_3, toPolar_4, otherwise_8;
 LT_5 = {ctor:"LT"};
 EQ_6 = {ctor:"EQ"};
 GT_7 = {ctor:"GT"};
 radians_0 = function(t_9){
  return t_9;};
 degrees_1 = function(d_10){
  return ((d_10*Math.PI)/180);};
 turns_2 = function(r_11){
  return ((2*Math.PI)*r_11);};
 fromPolar_3 = function(_22000_12){
  return (e=_22000_12.ctor==='Tuple2'?{ctor:"Tuple2", _0:(_22000_12._0*N.cos(_22000_12._1)), _1:(_22000_12._0*N.sin(_22000_12._1))}:null,e!==null?e:_E.Case('Line 22, Column 20'));};
 toPolar_4 = function(_27000_15){
  return (e=_27000_15.ctor==='Tuple2'?{ctor:"Tuple2", _0:N.sqrt((Math.pow(_27000_15._0,2)+Math.pow(_27000_15._1,2))), _1:A2(N.atan2, _27000_15._1, _27000_15._0)}:null,e!==null?e:_E.Case('Line 27, Column 18'));};
 otherwise_8 = true;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Prelude||{};
 _.$op = {};
 _.radians = radians_0;
 _.degrees = degrees_1;
 _.turns = turns_2;
 _.fromPolar = fromPolar_3;
 _.toPolar = toPolar_4;
 _.LT = LT_5;
 _.EQ = EQ_6;
 _.GT = GT_7;
 _.otherwise = otherwise_8
 return elm.Prelude = _;
 };
Elm.Random = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var R = Elm.Native.Random(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Random||{};
 _.$op = {}
 return elm.Random = _;
 };
Elm.Set = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var Dict = Elm.Dict(elm);
 var List = Elm.List(elm);
 var e, case0, empty_0, singleton_1, insert_2, remove_3, member_4, union_5, intersect_6, diff_7, toList_8, fromList_9, foldl_10, foldr_11, map_12;
 singleton_1 = function(k_13){
  return A2(Dict.singleton, k_13, {ctor:"Tuple0"});};
 insert_2 = function(k_14){
  return A2(Dict.insert, k_14, {ctor:"Tuple0"});};
 fromList_9 = function(xs_15){
  return A3(List.foldl, insert_2, empty_0, xs_15);};
 foldl_10 = F3(function(f_16, b_17, s_18){
  return A3(Dict.foldl, function(k_19){
   return function(__20){
    return function(b_21){
     return A2(f_16, k_19, b_21);};};}, b_17, s_18);});
 foldr_11 = F3(function(f_22, b_23, s_24){
  return A3(Dict.foldr, function(k_25){
   return function(__26){
    return function(b_27){
     return A2(f_22, k_25, b_27);};};}, b_23, s_24);});
 map_12 = F2(function(f_28, s_29){
  return fromList_9(A2(List.map, f_28, toList_8(s_29)));});
 empty_0 = Dict.empty;
 remove_3 = Dict.remove;
 member_4 = Dict.member;
 union_5 = Dict.union;
 intersect_6 = Dict.intersect;
 diff_7 = Dict.diff;
 toList_8 = Dict.keys;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Set||{};
 _.$op = {};
 _.empty = empty_0;
 _.singleton = singleton_1;
 _.insert = insert_2;
 _.remove = remove_3;
 _.member = member_4;
 _.union = union_5;
 _.intersect = intersect_6;
 _.diff = diff_7;
 _.toList = toList_8;
 _.fromList = fromList_9;
 _.foldl = foldl_10;
 _.foldr = foldr_11;
 _.map = map_12
 return elm.Set = _;
 };
Elm.Signal = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var S = Elm.Native.Signal(elm);
 var L = Elm.List(elm);
 var e, case0, combine_0;
 combine_0 = A2(L.foldr, S.lift2(function(x_1){
  return function(y_2){
   return _L.Cons(x_1,y_2);};}), S.constant(_L.Nil));
 elm.Native = elm.Native||{};
 var _ = elm.Native.Signal||{};
 _.$op = {};
 _.combine = combine_0
 return elm.Signal = _;
 };
Elm.Text = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var T = Elm.Native.Text(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Text||{};
 _.$op = {}
 return elm.Text = _;
 };
Elm.Time = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var T = Elm.Native.Time(elm);
 var e, case0, millisecond_0, second_1, minute_2, hour_3, inMilliseconds_4, inSeconds_5, inMinutes_6, inHours_7;
 inMilliseconds_4 = function(t_8){
  return t_8;};
 inSeconds_5 = function(t_9){
  return (t_9/second_1);};
 inMinutes_6 = function(t_10){
  return (t_10/minute_2);};
 inHours_7 = function(t_11){
  return (t_11/hour_3);};
 millisecond_0 = 1;
 second_1 = (1000*millisecond_0);
 minute_2 = (60*second_1);
 hour_3 = (60*minute_2);
 elm.Native = elm.Native||{};
 var _ = elm.Native.Time||{};
 _.$op = {};
 _.millisecond = millisecond_0;
 _.second = second_1;
 _.minute = minute_2;
 _.hour = hour_3;
 _.inMilliseconds = inMilliseconds_4;
 _.inSeconds = inSeconds_5;
 _.inMinutes = inMinutes_6;
 _.inHours = inHours_7
 return elm.Time = _;
 };
Elm.Touch = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var T = Elm.Native.Touch(elm);
 var e, case0, Touch_0;
 Touch_0 = F6(function(x_1, y_2, id_3, x0_4, y0_5, t0_6){
  return {
    _:{
    },
    id:id_3,
    t0:t0_6,
    x:x_1,
    x0:x0_4,
    y:y_2,
    y0:y0_5};});
 elm.Native = elm.Native||{};
 var _ = elm.Native.Touch||{};
 _.$op = {};
 _.Touch = Touch_0
 return elm.Touch = _;
 };
Elm.WebSocket = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var WS = Elm.Native.WebSocket(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.WebSocket||{};
 _.$op = {}
 return elm.WebSocket = _;
 };
Elm.Window = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var W = Elm.Native.Window(elm);
 var e, case0;
 elm.Native = elm.Native||{};
 var _ = elm.Native.Window||{};
 _.$op = {}
 return elm.Window = _;
 };
Elm.Graphics = Elm.Graphics||{};
Elm.Graphics.Collage = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.List(elm); var List = _;
 var _ = Elm.Native.Utils(elm); var Native = Native||{};Native.Utils = _;
 var toFloat = _.toFloat;
 var _ = Elm.Either(elm); var Either = _;
 var Matrix = Elm.Native.Matrix2D(elm);
 var N = Elm.Native.Graphics.Collage(elm);
 var _ = Elm.Graphics.Element(elm); var Graphics = Graphics||{};Graphics.Element = _;
 var _ = Elm.Color(elm); var Color = _;
 var e, case0, Form_0, LineStyle_10, defaultLine_11, solid_12, dashed_13, dotted_14, form_20, fill_21, filled_22, textured_23, gradient_24, outlined_25, traced_26, sprite_27, toForm_28, group_29, groupTransform_30, rotate_31, scale_32, move_33, moveX_34, moveY_35, path_36, segment_37, polygon_38, rect_39, square_40, oval_41, n_100, t_101, hw_102, hh_103, f_104, circle_42, ngon_43, m_109, t_110, f_111;
 Solid_1 = function(a1){
  return {ctor:"Solid", _0:a1};};
 Texture_2 = function(a1){
  return {ctor:"Texture", _0:a1};};
 Gradient_3 = function(a1){
  return {ctor:"Gradient", _0:a1};};
 Flat_4 = {ctor:"Flat"};
 Round_5 = {ctor:"Round"};
 Padded_6 = {ctor:"Padded"};
 Smooth_7 = {ctor:"Smooth"};
 Sharp_8 = function(a1){
  return {ctor:"Sharp", _0:a1};};
 Clipped_9 = {ctor:"Clipped"};
 FPath_15 = F2(function(a1, a2){
  return {ctor:"FPath", _0:a1, _1:a2};});
 FShape_16 = F2(function(a1, a2){
  return {ctor:"FShape", _0:a1, _1:a2};});
 FImage_17 = F4(function(a1, a2, a3, a4){
  return {ctor:"FImage", _0:a1, _1:a2, _2:a3, _3:a4};});
 FElement_18 = function(a1){
  return {ctor:"FElement", _0:a1};};
 FGroup_19 = F2(function(a1, a2){
  return {ctor:"FGroup", _0:a1, _1:a2};});
 Form_0 = F5(function(theta_44, scale_45, x_46, y_47, form_48){
  return {
    _:{
    },
    form:form_48,
    scale:scale_45,
    theta:theta_44,
    x:x_46,
    y:y_47};});
 LineStyle_10 = F6(function(color_49, width_50, cap_51, join_52, dashing_53, dashOffset_54){
  return {
    _:{
    },
    cap:cap_51,
    color:color_49,
    dashOffset:dashOffset_54,
    dashing:dashing_53,
    join:join_52,
    width:width_50};});
 solid_12 = function(clr_55){
  return _N.replace([['color',clr_55]], defaultLine_11);};
 dashed_13 = function(clr_56){
  return _N.replace([['color',clr_56],['dashing',_L.Cons(8,_L.Cons(4,_L.Nil))]], defaultLine_11);};
 dotted_14 = function(clr_57){
  return _N.replace([['color',clr_57],['dashing',_L.Cons(3,_L.Cons(3,_L.Nil))]], defaultLine_11);};
 form_20 = function(f_58){
  return {
    _:{
    },
    form:f_58,
    scale:1,
    theta:0,
    x:0,
    y:0};};
 fill_21 = F2(function(style_59, shape_60){
  return form_20(A2(FShape_16, Either.Right(style_59), shape_60));});
 filled_22 = F2(function(color_61, shape_62){
  return A2(fill_21, Solid_1(color_61), shape_62);});
 textured_23 = F2(function(src_63, shape_64){
  return A2(fill_21, Texture_2(src_63), shape_64);});
 gradient_24 = F2(function(grad_65, shape_66){
  return A2(fill_21, Gradient_3(grad_65), shape_66);});
 outlined_25 = F2(function(style_67, shape_68){
  return form_20(A2(FShape_16, Either.Left(style_67), shape_68));});
 traced_26 = F2(function(style_69, path_70){
  return form_20(A2(FPath_15, style_69, path_70));});
 sprite_27 = F4(function(w_71, h_72, pos_73, src_74){
  return form_20(A4(FImage_17, w_71, h_72, pos_73, src_74));});
 toForm_28 = function(e_75){
  return form_20(FElement_18(e_75));};
 group_29 = function(fs_76){
  return form_20(A2(FGroup_19, Matrix.identity, fs_76));};
 groupTransform_30 = F2(function(matrix_77, fs_78){
  return form_20(A2(FGroup_19, matrix_77, fs_78));});
 rotate_31 = F2(function(t_79, f_80){
  return _N.replace([['theta',(f_80.theta+t_79)]], f_80);});
 scale_32 = F2(function(s_81, f_82){
  return _N.replace([['scale',(f_82.scale*s_81)]], f_82);});
 move_33 = F2(function(_138000_83, f_84){
  return (e=_138000_83.ctor==='Tuple2'?_N.replace([['x',(f_84.x+_138000_83._0)],['y',(f_84.y+_138000_83._1)]], f_84):null,e!==null?e:_E.Case('Line 138, Column 20'));});
 moveX_34 = F2(function(x_87, f_88){
  return _N.replace([['x',(f_88.x+x_87)]], f_88);});
 moveY_35 = F2(function(y_89, f_90){
  return _N.replace([['y',(f_90.y+y_89)]], f_90);});
 path_36 = function(ps_91){
  return ps_91;};
 segment_37 = F2(function(p1_92, p2_93){
  return _L.Cons(p1_92,_L.Cons(p2_93,_L.Nil));});
 polygon_38 = function(points_94){
  return points_94;};
 rect_39 = F2(function(w_95, h_96){
  return _L.Cons({ctor:"Tuple2", _0:(0-(w_95/2)), _1:(0-(h_96/2))},_L.Cons({ctor:"Tuple2", _0:(0-(w_95/2)), _1:(h_96/2)},_L.Cons({ctor:"Tuple2", _0:(w_95/2), _1:(h_96/2)},_L.Cons({ctor:"Tuple2", _0:(w_95/2), _1:(0-(h_96/2))},_L.Nil))));});
 square_40 = function(n_97){
  return A2(rect_39, w, h);};
 oval_41 = F2(function(w_98, h_99){
  return (n_100 = 50, t_101 = ((2*Math.PI)/n_100), hw_102 = (w_98/2), hh_103 = (h_99/2), f_104 = function(i_105){
   return {ctor:"Tuple2", _0:(hw_102*Math.cos((t_101*i_105))), _1:(hh_103*Math.sin((t_101*i_105)))};}, A2(List.map, f_104, _L.range(0,(n_100-1))));});
 circle_42 = function(r_106){
  return A2(oval_41, (2*r_106), (2*r_106));};
 ngon_43 = F2(function(n_107, r_108){
  return (m_109 = toFloat(n_107), t_110 = ((2*Math.PI)/m_109), f_111 = function(i_112){
   return {ctor:"Tuple2", _0:(r_108*Math.cos((t_110*i_112))), _1:(r_108*Math.sin((t_110*i_112)))};}, A2(List.map, f_111, _L.range(0,(n_107-1))));});
 defaultLine_11 = {
   _:{
   },
   cap:Flat_4,
   color:Color.black,
   dashOffset:0,
   dashing:_L.Nil,
   join:Sharp_8(10),
   width:1};
 elm.Native = elm.Native||{};
 elm.Native.Graphics = elm.Native.Graphics||{};
 var _ = elm.Native.Graphics.Collage||{};
 _.$op = {};
 _.Form = Form_0;
 _.Solid = Solid_1;
 _.Texture = Texture_2;
 _.Gradient = Gradient_3;
 _.Flat = Flat_4;
 _.Round = Round_5;
 _.Padded = Padded_6;
 _.Smooth = Smooth_7;
 _.Sharp = Sharp_8;
 _.Clipped = Clipped_9;
 _.LineStyle = LineStyle_10;
 _.defaultLine = defaultLine_11;
 _.solid = solid_12;
 _.dashed = dashed_13;
 _.dotted = dotted_14;
 _.FPath = FPath_15;
 _.FShape = FShape_16;
 _.FImage = FImage_17;
 _.FElement = FElement_18;
 _.FGroup = FGroup_19;
 _.form = form_20;
 _.fill = fill_21;
 _.filled = filled_22;
 _.textured = textured_23;
 _.gradient = gradient_24;
 _.outlined = outlined_25;
 _.traced = traced_26;
 _.sprite = sprite_27;
 _.toForm = toForm_28;
 _.group = group_29;
 _.groupTransform = groupTransform_30;
 _.rotate = rotate_31;
 _.scale = scale_32;
 _.move = move_33;
 _.moveX = moveX_34;
 _.moveY = moveY_35;
 _.path = path_36;
 _.segment = segment_37;
 _.polygon = polygon_38;
 _.rect = rect_39;
 _.square = square_40;
 _.oval = oval_41;
 _.circle = circle_42;
 _.ngon = ngon_43
 elm.Graphics = elm.Graphics||{};
 return elm.Graphics.Collage = _;
 };
Elm.Graphics = Elm.Graphics||{};
Elm.Graphics.Element = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.Native.Utils(elm); var Native = Native||{};Native.Utils = _;
 var guid = _.guid, max = _.max, htmlHeight = _.htmlHeight;
 var JS = Elm.JavaScript(elm);
 var List = Elm.List(elm);
 var _ = Elm.Color(elm); var Color = _;
 var _ = Elm.Maybe(elm); var Maybe = _;
 var Just = _.Just, Nothing = _.Nothing;
 var e, case0, Properties_0, Element_1, widthOf_2, heightOf_3, sizeOf_4, width_5, p_84, props_85, _50000_89, w_90, h_91, height_6, p_98, props_99, opacity_7, p_104, color_8, p_107, tag_9, p_110, link_10, p_113, emptyStr_11, newElement_12, image_22, fittedImage_23, croppedImage_24, Position_30, container_31, spacer_32, flow_39, ws_139, hs_140, newFlow_141, above_40, below_41, beside_42, layers_43, ws_151, hs_152, absolute_44, relative_45, middle_46, topLeft_47, topRight_48, bottomLeft_49, bottomRight_50, midLeft_51, midRight_52, midTop_53, midBottom_54, middleAt_55, topLeftAt_56, topRightAt_57, bottomLeftAt_58, bottomRightAt_59, midLeftAt_60, midRightAt_61, midTopAt_62, midBottomAt_63, up_64, down_65, left_66, right_67, inward_68, outward_69;
 Image_13 = F4(function(a1, a2, a3, a4){
  return {ctor:"Image", _0:a1, _1:a2, _2:a3, _3:a4};});
 Container_14 = F2(function(a1, a2){
  return {ctor:"Container", _0:a1, _1:a2};});
 Flow_15 = F2(function(a1, a2){
  return {ctor:"Flow", _0:a1, _1:a2};});
 Spacer_16 = {ctor:"Spacer"};
 RawHtml_17 = function(a1){
  return {ctor:"RawHtml", _0:a1};};
 Custom_18 = {ctor:"Custom"};
 Plain_19 = {ctor:"Plain"};
 Fitted_20 = {ctor:"Fitted"};
 Cropped_21 = function(a1){
  return {ctor:"Cropped", _0:a1};};
 P_25 = {ctor:"P"};
 Z_26 = {ctor:"Z"};
 N_27 = {ctor:"N"};
 Absolute_28 = function(a1){
  return {ctor:"Absolute", _0:a1};};
 Relative_29 = function(a1){
  return {ctor:"Relative", _0:a1};};
 DUp_33 = {ctor:"DUp"};
 DDown_34 = {ctor:"DDown"};
 DLeft_35 = {ctor:"DLeft"};
 DRight_36 = {ctor:"DRight"};
 DIn_37 = {ctor:"DIn"};
 DOut_38 = {ctor:"DOut"};
 Properties_0 = F7(function(id_70, width_71, height_72, opacity_73, color_74, href_75, tag_76){
  return {
    _:{
    },
    color:color_74,
    height:height_72,
    href:href_75,
    id:id_70,
    opacity:opacity_73,
    tag:tag_76,
    width:width_71};});
 Element_1 = F2(function(props_77, element_78){
  return {
    _:{
    },
    element:element_78,
    props:props_77};});
 widthOf_2 = function(e_79){
  return e_79.props.width;};
 heightOf_3 = function(e_80){
  return e_80.props.height;};
 sizeOf_4 = function(e_81){
  return {ctor:"Tuple2", _0:e_81.props.width, _1:e_81.props.height};};
 width_5 = F2(function(nw_82, e_83){
  return (p_84 = e_83.props, props_85 = (case0 = e_83.element, (e=case0.ctor==='Image'?_N.replace([['height',((case0._2/case0._1)*nw_82)]], p_84):case0.ctor==='RawHtml'?_N.replace([['height',(_50000_89 = A2(htmlHeight, nw_82, case0._0), w_90 = (e=_50000_89.ctor==='Tuple2'?_50000_89._0:null,e!==null?e:_E.Case('Line 50, Column 71')), h_91 = (e=_50000_89.ctor==='Tuple2'?_50000_89._1:null,e!==null?e:_E.Case('Line 50, Column 71')), h_91)]], p_84):null,e!==null?e:p_84)), {
    _:{
    },
    element:e_83.element,
    props:_N.replace([['width',nw_82]], props_85)});});
 height_6 = F2(function(nh_96, e_97){
  return (p_98 = e_97.props, props_99 = (case12 = e_97.element, (e=case12.ctor==='Image'?_N.replace([['width',((case12._1/case12._2)*nh_96)]], p_98):null,e!==null?e:p_98)), {
    _:{
    },
    element:e_97.element,
    props:_N.replace([['height',nh_96]], p_98)});});
 opacity_7 = F2(function(o_102, e_103){
  return (p_104 = e_103.props, {
    _:{
    },
    element:e_103.element,
    props:_N.replace([['opacity',o_102]], p_104)});});
 color_8 = F2(function(c_105, e_106){
  return (p_107 = e_106.props, {
    _:{
    },
    element:e_106.element,
    props:_N.replace([['color',Just(c_105)]], p_107)});});
 tag_9 = F2(function(name_108, e_109){
  return (p_110 = e_109.props, {
    _:{
    },
    element:e_109.element,
    props:_N.replace([['tag',JS.fromString(name_108)]], p_110)});});
 link_10 = F2(function(href_111, e_112){
  return (p_113 = e_112.props, {
    _:{
    },
    element:e_112.element,
    props:_N.replace([['href',JS.fromString(href_111)]], p_113)});});
 newElement_12 = F3(function(w_114, h_115, e_116){
  return {
    _:{
    },
    element:e_116,
    props:A7(Properties_0, guid({ctor:"Tuple0"}), w_114, h_115, 1, Nothing, emptyStr_11, emptyStr_11)};});
 image_22 = F3(function(w_117, h_118, src_119){
  return A3(newElement_12, w_117, h_118, A4(Image_13, Plain_19, w_117, h_118, JS.fromString(src_119)));});
 fittedImage_23 = F3(function(w_120, h_121, src_122){
  return A3(newElement_12, w_120, h_121, A4(Image_13, Fitted_20, w_120, h_121, JS.fromString(src_122)));});
 croppedImage_24 = F4(function(w_123, h_124, pos_125, src_126){
  return A3(newElement_12, w_123, h_124, A4(Image_13, Cropped_21(pos_125), w_123, h_124, JS.fromString(src_126)));});
 Position_30 = F4(function(horizontal_127, vertical_128, x_129, y_130){
  return {
    _:{
    },
    horizontal:horizontal_127,
    vertical:vertical_128,
    x:x_129,
    y:y_130};});
 container_31 = F4(function(w_131, h_132, pos_133, e_134){
  return A3(newElement_12, w_131, h_132, A2(Container_14, pos_133, e_134));});
 spacer_32 = F2(function(w_135, h_136){
  return A3(newElement_12, w_135, h_136, Spacer_16);});
 flow_39 = F2(function(dir_137, es_138){
  return (ws_139 = A2(List.map, widthOf_2, es_138), hs_140 = A2(List.map, heightOf_3, es_138), newFlow_141 = F2(function(w_142, h_143){
   return A3(newElement_12, w_142, h_143, A2(Flow_15, dir_137, es_138));}), (_N.eq(es_138,_L.Nil)?A2(spacer_32, 0, 0):(e=dir_137.ctor==='DDown'?A2(newFlow_141, List.maximum(ws_139), List.sum(hs_140)):dir_137.ctor==='DIn'?A2(newFlow_141, List.maximum(ws_139), List.maximum(hs_140)):dir_137.ctor==='DLeft'?A2(newFlow_141, List.sum(ws_139), List.maximum(hs_140)):dir_137.ctor==='DOut'?A2(newFlow_141, List.maximum(ws_139), List.maximum(hs_140)):dir_137.ctor==='DRight'?A2(newFlow_141, List.sum(ws_139), List.maximum(hs_140)):dir_137.ctor==='DUp'?A2(newFlow_141, List.maximum(ws_139), List.sum(hs_140)):null,e!==null?e:_E.Case('Line 152, Column 3'))));});
 above_40 = F2(function(hi_144, lo_145){
  return A3(newElement_12, A2(max, widthOf_2(hi_144), widthOf_2(lo_145)), (heightOf_3(hi_144)+heightOf_3(lo_145)), A2(Flow_15, DDown_34, _L.Cons(hi_144,_L.Cons(lo_145,_L.Nil))));});
 below_41 = F2(function(lo_146, hi_147){
  return A3(newElement_12, A2(max, widthOf_2(hi_147), widthOf_2(lo_146)), (heightOf_3(hi_147)+heightOf_3(lo_146)), A2(Flow_15, DDown_34, _L.Cons(hi_147,_L.Cons(lo_146,_L.Nil))));});
 beside_42 = F2(function(lft_148, rht_149){
  return A3(newElement_12, (widthOf_2(lft_148)+widthOf_2(rht_149)), A2(max, heightOf_3(lft_148), heightOf_3(rht_149)), A2(Flow_15, right_67, _L.Cons(lft_148,_L.Cons(rht_149,_L.Nil))));});
 layers_43 = function(es_150){
  return (ws_151 = A2(List.map, widthOf_2, es_150), hs_152 = A2(List.map, heightOf_3, es_150), A3(newElement_12, List.maximum(ws_151), List.maximum(hs_152), A2(Flow_15, DOut_38, es_150)));};
 middleAt_55 = F2(function(x_153, y_154){
  return {
    _:{
    },
    horizontal:Z_26,
    vertical:Z_26,
    x:x_153,
    y:y_154};});
 topLeftAt_56 = F2(function(x_155, y_156){
  return {
    _:{
    },
    horizontal:N_27,
    vertical:P_25,
    x:x_155,
    y:y_156};});
 topRightAt_57 = F2(function(x_157, y_158){
  return {
    _:{
    },
    horizontal:P_25,
    vertical:P_25,
    x:x_157,
    y:y_158};});
 bottomLeftAt_58 = F2(function(x_159, y_160){
  return {
    _:{
    },
    horizontal:N_27,
    vertical:N_27,
    x:x_159,
    y:y_160};});
 bottomRightAt_59 = F2(function(x_161, y_162){
  return {
    _:{
    },
    horizontal:P_25,
    vertical:N_27,
    x:x_161,
    y:y_162};});
 midLeftAt_60 = F2(function(x_163, y_164){
  return {
    _:{
    },
    horizontal:N_27,
    vertical:Z_26,
    x:x_163,
    y:y_164};});
 midRightAt_61 = F2(function(x_165, y_166){
  return {
    _:{
    },
    horizontal:P_25,
    vertical:Z_26,
    x:x_165,
    y:y_166};});
 midTopAt_62 = F2(function(x_167, y_168){
  return {
    _:{
    },
    horizontal:Z_26,
    vertical:P_25,
    x:x_167,
    y:y_168};});
 midBottomAt_63 = F2(function(x_169, y_170){
  return {
    _:{
    },
    horizontal:Z_26,
    vertical:N_27,
    x:x_169,
    y:y_170};});
 emptyStr_11 = JS.fromString(_str(''));
 absolute_44 = Absolute_28;
 relative_45 = Relative_29;
 middle_46 = {
   _:{
   },
   horizontal:Z_26,
   vertical:Z_26,
   x:Relative_29(0.5),
   y:Relative_29(0.5)};
 topLeft_47 = {
   _:{
   },
   horizontal:N_27,
   vertical:P_25,
   x:Absolute_28(0),
   y:Absolute_28(0)};
 topRight_48 = _N.replace([['horizontal',P_25]], topLeft_47);
 bottomLeft_49 = _N.replace([['vertical',N_27]], topLeft_47);
 bottomRight_50 = _N.replace([['horizontal',P_25]], bottomLeft_49);
 midLeft_51 = _N.replace([['horizontal',N_27],['x',Absolute_28(0)]], middle_46);
 midRight_52 = _N.replace([['horizontal',P_25]], midLeft_51);
 midTop_53 = _N.replace([['vertical',P_25],['y',Absolute_28(0)]], middle_46);
 midBottom_54 = _N.replace([['vertical',N_27]], midTop_53);
 up_64 = DUp_33;
 down_65 = DDown_34;
 left_66 = DLeft_35;
 right_67 = DRight_36;
 inward_68 = DIn_37;
 outward_69 = DOut_38;
 elm.Native = elm.Native||{};
 elm.Native.Graphics = elm.Native.Graphics||{};
 var _ = elm.Native.Graphics.Element||{};
 _.$op = {};
 _.widthOf = widthOf_2;
 _.heightOf = heightOf_3;
 _.sizeOf = sizeOf_4;
 _.width = width_5;
 _.height = height_6;
 _.opacity = opacity_7;
 _.color = color_8;
 _.tag = tag_9;
 _.link = link_10;
 _.newElement = newElement_12;
 _.image = image_22;
 _.fittedImage = fittedImage_23;
 _.croppedImage = croppedImage_24;
 _.container = container_31;
 _.spacer = spacer_32;
 _.flow = flow_39;
 _.above = above_40;
 _.below = below_41;
 _.beside = beside_42;
 _.layers = layers_43;
 _.absolute = absolute_44;
 _.relative = relative_45;
 _.middle = middle_46;
 _.topLeft = topLeft_47;
 _.topRight = topRight_48;
 _.bottomLeft = bottomLeft_49;
 _.bottomRight = bottomRight_50;
 _.midLeft = midLeft_51;
 _.midRight = midRight_52;
 _.midTop = midTop_53;
 _.midBottom = midBottom_54;
 _.middleAt = middleAt_55;
 _.topLeftAt = topLeftAt_56;
 _.topRightAt = topRightAt_57;
 _.bottomLeftAt = bottomLeftAt_58;
 _.bottomRightAt = bottomRightAt_59;
 _.midLeftAt = midLeftAt_60;
 _.midRightAt = midRightAt_61;
 _.midTopAt = midTopAt_62;
 _.midBottomAt = midBottomAt_63;
 _.up = up_64;
 _.down = down_65;
 _.left = left_66;
 _.right = right_67;
 _.inward = inward_68;
 _.outward = outward_69
 elm.Graphics = elm.Graphics||{};
 return elm.Graphics.Element = _;
 };
Elm.Graphics = Elm.Graphics||{};
Elm.Graphics.Input = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var _ = Elm.Signal(elm); var Signal = _;
 var lift = _.lift;
 var N = Elm.Native.Graphics.Input(elm);
 var e, case0, id_0, button_1, pool_11, customButton_2, pool_15, checkbox_3, cbs_17, FieldState_4, emptyFieldState_5, field_6, tfs_22, password_7, tfs_25, email_8, tfs_28;
 id_0 = function(x_9){
  return x_9;};
 button_1 = function(txt_10){
  return (pool_11 = N.buttons({ctor:"Tuple0"}), {ctor:"Tuple2", _0:A2(pool_11.button, {ctor:"Tuple0"}, txt_10), _1:pool_11.events});};
 customButton_2 = F3(function(up_12, hover_13, down_14){
  return (pool_15 = N.customButtons({ctor:"Tuple0"}), {ctor:"Tuple2", _0:A4(pool_15.button, {ctor:"Tuple0"}, up_12, hover_13, down_14), _1:pool_15.events});});
 checkbox_3 = function(b_16){
  return (cbs_17 = N.checkboxes(b_16), {ctor:"Tuple2", _0:A2(lift, cbs_17.box(id_0), cbs_17.events), _1:cbs_17.events});};
 FieldState_4 = F3(function(string_18, selectionStart_19, selectionEnd_20){
  return {
    _:{
    },
    selectionEnd:selectionEnd_20,
    selectionStart:selectionStart_19,
    string:string_18};});
 field_6 = function(placeHolder_21){
  return (tfs_22 = N.fields(emptyFieldState_5), {ctor:"Tuple2", _0:A2(lift, A2(tfs_22.field, id_0, placeHolder_21), tfs_22.events), _1:A2(lift, function(__23){
   return __23.string;}, tfs_22.events)});};
 password_7 = function(placeHolder_24){
  return (tfs_25 = N.passwords(emptyFieldState_5), {ctor:"Tuple2", _0:A2(lift, A2(tfs_25.field, id_0, placeHolder_24), tfs_25.events), _1:A2(lift, function(__26){
   return __26.string;}, tfs_25.events)});};
 email_8 = function(placeHolder_27){
  return (tfs_28 = N.emails(emptyFieldState_5), {ctor:"Tuple2", _0:A2(lift, A2(tfs_28.field, id_0, placeHolder_27), tfs_28.events), _1:A2(lift, function(__29){
   return __29.string;}, tfs_28.events)});};
 emptyFieldState_5 = {
   _:{
   },
   selectionEnd:0,
   selectionStart:0,
   string:_str('')};
 elm.Native = elm.Native||{};
 elm.Native.Graphics = elm.Native.Graphics||{};
 var _ = elm.Native.Graphics.Input||{};
 _.$op = {};
 _.id = id_0;
 _.button = button_1;
 _.customButton = customButton_2;
 _.checkbox = checkbox_3;
 _.FieldState = FieldState_4;
 _.emptyFieldState = emptyFieldState_5;
 _.field = field_6;
 _.password = password_7;
 _.email = email_8
 elm.Graphics = elm.Graphics||{};
 return elm.Graphics.Input = _;
 };
Elm.JavaScript = Elm.JavaScript||{};
Elm.JavaScript.Experimental = function(elm){
 var N = Elm.Native, _N = N.Utils(elm), _L = N.List(elm), _E = N.Error(elm), _str = N.JavaScript(elm).toString;
 var $op = {};
 var JS = Elm.JavaScript(elm);
 var e, case0, toRecord_0, fromRecord_1;
 toRecord_0 = JS.toRecord;
 fromRecord_1 = JS.fromRecord;
 elm.Native = elm.Native||{};
 elm.Native.JavaScript = elm.Native.JavaScript||{};
 var _ = elm.Native.JavaScript.Experimental||{};
 _.$op = {};
 _.toRecord = toRecord_0;
 _.fromRecord = fromRecord_1
 elm.JavaScript = elm.JavaScript||{};
 return elm.JavaScript.Experimental = _;
 };
(function() {
'use strict';

Elm.fullscreen = function(module) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = "html,head,body { padding:0; margin:0; }" +
        "body { font-family: calibri, helvetica, arial, sans-serif; }";
    document.head.appendChild(style);
    var container = document.createElement('div');
    document.body.appendChild(container);
    return init(ElmRuntime.Display.FULLSCREEN, container, module);
};

Elm.byId = function(id, module) {
    var container = document.getElementById(id);
    var tag = container.tagName;
    if (tag !== 'DIV') {
        throw new Error('Elm.byId must be given a div, not a ' + tag + '.');
    }
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    return init(ElmRuntime.Display.COMPONENT, container, module);
};

Elm.worker = function(module) {
    return init(ElmRuntime.Display.NONE, {}, module);
};

function init(display, container, module) {
  // defining state needed for an instance of the Elm RTS
  var signalGraph = null;
  var inputs = [];
  var visualModel = null;

  function notify(id, v) {
    var timestep = Date.now();
    var hasListener = false;
    for (var i = inputs.length; i--; ) {
      // must maintain the order of this stmt to avoid having the ||
      // short-circuiting the necessary work of recv
      hasListener = inputs[i].recv(timestep, id, v) || hasListener;
    }
    return hasListener;
  }

  container.offsetX = 0;
  container.offsetY = 0;

  // create the actual RTS. Any impure modules will attach themselves to this
  // object. This permits many Elm programs to be embedded per document.
  var elm = { notify:notify,
              node:container,
              display:display,
              id:ElmRuntime.guid(),
              inputs:inputs
  };

  // Set up methods to communicate with Elm program from JS.
  function send(name, value) {
      if (typeof value === 'undefined') return function(v) { return send(name,v); };
      var e = document.createEvent('Event');
      e.initEvent(name + '_' + elm.id, true, true);
      e.value = value;
      document.dispatchEvent(e);
  }
  function recv(name, handler) {
      document.addEventListener(name + '_' + elm.id, handler);
  }

  recv('log', function(e) {console.log(e.value)});
  recv('title', function(e) {document.title = e.value});
  recv('redirect', function(e) {
    if (e.value.length > 0) { window.location = e.value; }
  });

  // If graphics are not enabled, escape early, skip over setting up DOM stuff.
  if (display === ElmRuntime.Display.NONE) {
      return { send : send, recv : recv };
  }

  var Render = ElmRuntime.use(ElmRuntime.Render.Element);

  // evaluate the given module and extract its 'main' value.
  signalGraph = module(elm).main;

  // make sure the signal graph is actually a signal, extract the visual model,
  // and filter out any unused inputs.
  var Signal = Elm.Signal(elm);
  if (!('recv' in signalGraph)) signalGraph = Signal.constant(signalGraph);
  visualModel = signalGraph.value;
  inputs = ElmRuntime.filterDeadInputs(inputs);
  
   // Add the visualModel to the DOM
  container.appendChild(Render.render(visualModel));
  if (elm.Native.Window) elm.Native.Window.resizeIfNeeded();
  
  // set up updates so that the DOM is adjusted as necessary.
  var update = Render.update;
  function domUpdate(value) {
      ElmRuntime.draw(function(_) {
              update(container.firstChild, visualModel, value);
              visualModel = value;
              if (elm.Native.Window) elm.Native.Window.resizeIfNeeded();
          });
      return value;
  }

  signalGraph = A2(Signal.lift, domUpdate, signalGraph);
    
  return { send : send, recv : recv, node : container };
};

}());
(function() {
'use strict';

ElmRuntime.Display = { FULLSCREEN: 0, COMPONENT: 1, NONE: 2 };

ElmRuntime.counter = 0;
ElmRuntime.guid = function() { return ElmRuntime.counter++; }

ElmRuntime.use = function(M) {
    if (typeof M === 'function') M = M();
    return M;
};

function isAlive(input) {
    if (!('defaultNumberOfKids' in input)) return true;
    var len = input.kids.length;
    if (len === 0) return false;
    if (len > input.defaultNumberOfKids) return true;
    var alive = false;
    for (var i = len; i--; ) {
        alive = alive || isAlive(input.kids[i]);
    }
    return alive;
}

ElmRuntime.filterDeadInputs = function(inputs) {
    var temp = [];
    for (var i = inputs.length; i--; ) {
        if (isAlive(inputs[i])) temp.push(inputs[i]);
    }
    return temp;
};

// define the draw function
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
    window.cancelAnimationFrame  = window[vendors[i]+'CancelAnimationFrame'] ||
                                   window[vendors[i]+'CancelRequestAnimationFrame'];
}

if (window.requestAnimationFrame && window.cancelAnimationFrame) {
    var previous = 0;
    ElmRuntime.draw = function(callback) {
        window.cancelAnimationFrame(previous);
        previous = window.requestAnimationFrame(callback);
    };
} else {
    ElmRuntime.draw = function(callback) { callback(); };
}

}());

ElmRuntime.Render.Collage = function() {
'use strict';

var Render = ElmRuntime.use(ElmRuntime.Render.Element);
var Matrix = Elm.Matrix2D({});
var Utils = ElmRuntime.use(ElmRuntime.Render.Utils);
var newElement = Utils.newElement,
    extract = Utils.extract, fromList = Utils.fromList,
    fromString = Utils.fromString, addTransform = Utils.addTransform;

function trace(ctx, path) {
    var points = fromList(path);
    var i = points.length - 1;
    if (i <= 0) return;
    ctx.moveTo(points[i]._0, points[i]._1);
    while (i--) { ctx.lineTo(points[i]._0, points[i]._1); }
    if (path.closed) {
        i = points.length - 1;
        ctx.lineTo(points[i]._0, points[i]._1);
    }
}

function line(ctx,style,path) {
    style.dashing.ctor === 'Nil' ? trace(ctx, path) : customLineHelp(ctx, style, path);
    ctx.stroke();
}

function customLineHelp(ctx, style, path) {
    var points = fromList(path);
    if (path.closed) points.push(points[0]);
    var pattern = fromList(style.dashing);
    var i = points.length - 1;
    if (i <= 0) return;
    var x0 = points[i]._0, y0 = points[i]._1;
    var x1=0, y1=0, dx=0, dy=0, remaining=0, nx=0, ny=0;
    var pindex = 0, plen = pattern.length;
    var draw = true, segmentLength = pattern[0];
    ctx.moveTo(x0,y0);
    while (i--) {
        x1 = points[i]._0; y1 = points[i]._1;
        dx = x1 - x0; dy = y1 - y0;
        remaining = Math.sqrt(dx * dx + dy * dy);
        while (segmentLength <= remaining) {
            x0 += dx * segmentLength / remaining;
            y0 += dy * segmentLength / remaining;
            ctx[draw ? 'lineTo' : 'moveTo'](x0, y0);
            // update starting position
            dx = x1 - x0; dy = y1 - y0;
            remaining = Math.sqrt(dx * dx + dy * dy);
            // update pattern
            draw = !draw;
            pindex = (pindex + 1) % plen;
            segmentLength = pattern[pindex];
        }
        if (remaining > 0) {
            ctx[draw ? 'lineTo' : 'moveTo'](x1, y1);
            segmentLength -= remaining;
        }
        x0 = x1; y0 = y1;
    }
}

function drawLine(ctx, style, path) {
    ctx.lineWidth = style.width;
    var cap = style.cap.ctor;
    ctx.lineCap = cap === 'Flat' ? 'butt' :
                  cap === 'Round' ? 'round' : 'square';
    var join = style.join.ctor;
    ctx.lineJoin = join === 'Smooth' ? 'round' :
                   join === 'Sharp' ? 'miter' : 'bevel';
    ctx.miterLimit = style.join._0 || 10;
    ctx.strokeStyle = extract(style.color);
    return line(ctx, style, path);
}

function texture(redo, ctx, src) {
    var img = new Image();
    img.src = fromString(src);
    img.onload = redo;
    return ctx.createPattern(img, 'repeat');
}

function gradient(ctx, grad) {
  var g;
  var stops = [];
  if (grad.ctor === 'Linear') {
    var p0 = grad._0, p1 = grad._1;
    g = ctx.createLinearGradient(p0._0, -p0._1, p1._0, -p1._1);
    stops = fromList(grad._2);
  } else {
    var p0 = grad._0, p2 = grad._2;
    g = ctx.createRadialGradient(p0._0, -p0._1, grad._1, p2._0, -p2._1, grad._3);
    stops = fromList(grad._4);
  }
  var len = stops.length;
  for (var i = 0; i < len; ++i) {
    var stop = stops[i];
    g.addColorStop(stop._0, extract(stop._1));
  }
  return g;
}

function drawShape(redo, ctx, style, path) {
    trace(ctx, path);
    var sty = style.ctor;
    ctx.fillStyle =
        sty === 'Solid' ? extract(style._0) :
        sty === 'Texture' ? texture(redo, ctx, style._0) : gradient(ctx, style._0);
    ctx.fill();
}

function drawImage(redo, ctx, form) {
    var img = new Image();
    img.onload = redo;
    img.src = fromString(form._3);
    var w = form._0,
        h = form._1,
        pos = form._2,
        srcX = pos._0,
        srcY = pos._1,
        srcW = w,
        srcH = h,
        destX = -w/2,
        destY = -h/2,
        destW = w,
        destH = h;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
}

function renderForm(redo, ctx, form) {
    ctx.save();
    var x = form.x, y = form.y, theta = form.theta, scale = form.scale;
    if (x !== 0 || y !== 0) ctx.translate(x, y);
    if (theta !== 0) ctx.rotate(theta);
    ctx.scale(scale,-scale);
    ctx.beginPath();
    var f = form.form;
    switch(f.ctor) {
    case 'FPath' : drawLine(ctx, f._0, f._1); break;
    case 'FImage': drawImage(redo, ctx, f); break;
    case 'FShape':
	if (f._0.ctor === 'Left') {
	    f._1.closed = true;
	    drawLine(ctx, f._0._0, f._1);
	} else {
            drawShape(redo, ctx, f._0._0, f._1);
        }
	break;
    }
    ctx.restore();
}

function formToMatrix(form) {
   var scale = form.scale;
   var matrix = A6( Matrix.matrix, scale, 0, 0, scale, scale * form.x, scale * form.y );

   var theta = form.theta
   if (theta !== 0)
       matrix = A2( Matrix.multiply, matrix, Matrix.rotation(theta) );

   return matrix;
}

function makeTransform(w, h, form, matrices) {
    var props = form.form._0.props;
    var m = A6( Matrix.matrix, 1, 0, 0, 1,
                (w - props.width)/2,
                (h - props.height)/2 );
    var len = matrices.length;
    for (var i = 0; i < len; ++i) { m = A2( Matrix.multiply, m, matrices[i] ); }
    m = A2( Matrix.multiply, m, formToMatrix(form) );

    return 'matrix(' +   m[0]  + ',' +   m[3]  + ',' +
                       (-m[1]) + ',' + (-m[4]) + ',' +
                         m[2]  + ',' +   m[5]  + ')';
}

function stepperHelp(list) {
    var arr = fromList(list);
    var i = 0;
    function peekNext() {
        return i < arr.length ? arr[i].form.ctor : '';
    }
    // assumes that there is a next element
    function next() {
        var out = arr[i];
        ++i;
        return out;
    }
    return { peekNext:peekNext, next:next };
}

function stepper(forms) {
    var ps = [stepperHelp(forms)];
    var matrices = [];
    function peekNext() {
        var len = ps.length;
        var formType = '';
        for (var i = 0; i < len; ++i ) {
            if (formType = ps[i].peekNext()) return formType;
        }
        return '';
    }
    // assumes that there is a next element
    function next(ctx) {
        while (!ps[0].peekNext()) { ps.shift(); matrices.pop(); ctx.restore(); }
        var out = ps[0].next();
        var f = out.form;
        if (f.ctor === 'FGroup') {
            ps.unshift(stepperHelp(f._1));
            var m = A2( Matrix.multiply, f._0, formToMatrix(out));
            ctx.save();
            ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
            matrices.push(m);
        }
        return out;
    }
    function transforms() { return matrices; }
    return { peekNext:peekNext, next:next, transforms:transforms };
}

function makeCanvas(w,h) {
    var canvas = newElement('canvas');
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.width  = w;
    canvas.height = h;
    return canvas;
}

function render(model) {
    var div = newElement('div');
    update(div, model, model);
    return div;
}

function updateTracker(w,h,div) {
    var kids = div.childNodes;
    var i = 0;
    function transform(transforms, ctx) {
        ctx.translate(w/2, h/2);
        var len = transforms.length;
        for (var i = 0; i < len; ++i) {
            var m = transforms[i];
            ctx.save();
            ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
        }
        return ctx;
    }
    function getContext(transforms) {
        while (i < kids.length) {
            var node = kids[i++];
            if (node.getContext) {
                node.width = w;
                node.height = h;
                node.style.width = w + 'px';
                node.style.height = h + 'px';
                return transform(transforms, node.getContext('2d'));
            }
            div.removeChild(node);
        }
        var canvas = makeCanvas(w,h);
        div.appendChild(canvas);
        // we have added a new node, so we must step our position
        ++i;
        return transform(transforms, canvas.getContext('2d'));
    }
    function element(matrices, form) {
        var container = kids[i];
        if (!container || container.getContext) {
            container = newElement('div');
            container.style.overflow = 'hidden';
            container.style.position = 'absolute';
            addTransform(container.style, 'scaleY(-1)');
            if (!container) {
                div.appendChild(container);
            } else {
                div.insertBefore(container, kids[i]);
            }
        }
        // we have added a new node, so we must step our position
        ++i;

        container.style.width = w + 'px';
        container.style.height = h + 'px';

        var elem = form.form._0;
        var node = container.firstChild;
        if (node) {
            Render.update(node, node.oldElement, elem);
        } else {
            node = Render.render(elem);
            container.appendChild(node);
        }
        node.oldElement = elem;
        addTransform(node.style, makeTransform(w, h, form, matrices));
    }
    return { getContext:getContext, element:element };
}


function update(div, _, model) {
    var w = model.w;
    var h = model.h;
    div.style.width = w + 'px';
    div.style.height = h + 'px';
    if (model.forms.ctor === 'Nil') {
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
    }
    var stpr = stepper(model.forms);
    var tracker = updateTracker(w,h,div);
    var ctx = null;
    var formType = '';

    while (formType = stpr.peekNext()) {
        if (ctx === null && formType !== 'FElement') {
            ctx = tracker.getContext(stpr.transforms());
            ctx.scale(1,-1);
        }
        var form = stpr.next(ctx);
        if (formType === 'FElement') {
            tracker.element(stpr.transforms(), form);
            ctx = null;
        } else if (formType !== 'FGroup') {
            renderForm(function() { update(div, model, model); }, ctx, form);
        }
    }
    return div;
}

return { render:render, update:update };

};

ElmRuntime.Render.Element = function() {
'use strict';

var Utils = ElmRuntime.use(ElmRuntime.Render.Utils);
var newElement = Utils.newElement, extract = Utils.extract,
    addTransform = Utils.addTransform, removeTransform = Utils.removeTransform,
    fromList = Utils.fromList, eq = Utils.eq;

function setProps(props, e) {
    e.style.width  = (props.width |0) + 'px';
    e.style.height = (props.height|0) + 'px';
    if (props.opacity !== 1) { e.style.opacity = props.opacity; }
    if (props.color.ctor === 'Just') {
	e.style.backgroundColor = extract(props.color._0);
    }
    if (props.tag !== '') { e.id = props.tag; }
    if (props.href !== '') {
	var a = newElement('a');
	a.href = props.href;
	a.appendChild(e);
	return a;
    }
    return e;
}

function image(props, img) {
    switch (img._0.ctor) {
    case 'Plain':   return plainImage(img._3);
    case 'Fitted':  return fittedImage(props.width, props.height, img._3);
    case 'Cropped': return croppedImage(img,props.width,props.height,img._3);
    }
}

function plainImage(src) {
    var img = newElement('img');
    img.src = src;
    img.name = src;
    img.style.display = "block";
    return img;
}

function fittedImage(w, h, src) {
    var e = newElement('div');
    e.style.position = "relative";
    e.style.overflow = "hidden";

    var img = newElement('img');
    img.onload = function() {
	img.style.position = 'absolute';
	img.style.margin = 'auto';

	var sw = w, sh = h;
	if (w / h > this.width / this.height) {
	    sh = Math.round(this.height * w / this.width);
	} else {
	    sw = Math.round(this.width * h / this.height);
	}
	img.style.width = sw + 'px';
	img.style.height = sh + 'px';
	img.style.left = ((w - sw) / 2) + 'px';
	img.style.top = ((h - sh) / 2) + 'px';
    };
    img.src = src;
    img.name = src;
    e.appendChild(img);
    return e;
}

function croppedImage(elem, w, h, src) {
    var pos = elem._0._0;
    var e = newElement('div');
    e.style.position = "relative";
    e.style.overflow = "hidden";

    var img = newElement('img');
    img.onload = function() {
	img.style.position = 'absolute';
	img.style.margin = 'auto';
	var sw = w / elem._1, sh = h / elem._2;
	img.style.width = ((this.width * sw)|0) + 'px';
	img.style.height = ((this.height * sh)|0) + 'px';
	img.style.left = ((- pos._0 * sw)|0) + 'px';
	img.style.top = ((- pos._1 * sh)|0) + 'px';
    };
    img.src = src;
    img.name = src;
    e.appendChild(img);
    return e;
}

function goIn(e) { e.style.position = 'absolute'; return e; }
function goDown(e) { return e }
function goRight(e) { e.style.styleFloat = e.style.cssFloat = "left"; return e; }
function flowWith(f, array) {
    var container = newElement('div');
    for (var i = array.length; i--; ) {
	container.appendChild(f(render(array[i])));
    }
    return container;
}

function flow(dir,elist) {
    var array = fromList(elist);
    switch(dir.ctor) {
    case "DDown":  array.reverse();
    case "DUp":    return flowWith(goDown,array);
    case "DRight": array.reverse();
    case "DLeft":  return flowWith(goRight,array);
    case "DOut":   array.reverse();
    case "DIn":    return flowWith(goIn,array);
    }
}

function toPos(pos) {
    switch(pos.ctor) {
    case "Absolute": return  pos._0 + "px";
    case "Relative": return (pos._0 * 100) + "%";
    }
}

function setPos(pos,w,h,e) {
    e.style.position = 'absolute';
    e.style.margin = 'auto';
    var transform = '';
    switch(pos.horizontal.ctor) {
    case 'P': e.style.right = toPos(pos.x); break;
    case 'Z': transform = 'translateX(' + ((-w/2)|0) + 'px) ';
    case 'N': e.style.left = toPos(pos.x); break;
    }
    switch(pos.vertical.ctor) {
    case 'N': e.style.bottom = toPos(pos.y); break;
    case 'Z': transform += 'translateY(' + ((-h/2)|0) + 'px)';
    case 'P': e.style.top = toPos(pos.y); break;
    }
    if (transform !== '') addTransform(e.style, transform);
    return e;
}

function container(pos,elem) {
    var e = render(elem);
    setPos(pos, elem.props.width, elem.props.height, e);
    var div = newElement('div');
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    div.appendChild(e);
    return div;
}

function rawHtml(html) {
    var e = newElement('div');
    e.innerHTML = html;
    return e;
}

function render(elem) { return setProps(elem.props, makeElement(elem)); }
function makeElement(e) {
    var elem = e.element;
    switch(elem.ctor) {
    case 'Image':     return image(e.props, elem);
    case 'Flow':      return flow(elem._0, elem._1);
    case 'Container': return container(elem._0, elem._1);
    case 'Spacer':    return newElement('div');
    case 'RawHtml':   return rawHtml(elem._0);
    case 'Custom':    return elem.render(elem.model);
    }
}

function update(node, curr, next) {
    if (node.tagName === 'A') { node = node.firstChild; }
    if (curr.props.id === next.props.id) return updateProps(node, curr, next);
    if (curr.element.ctor !== next.element.ctor) {
	node.parentNode.replaceChild(render(next),node);
	return true;
    }
    var nextE = next.element, currE = curr.element;
    switch(nextE.ctor) {
    case "Spacer": break;
    case "RawHtml":
        if (nextE._0 !== currE._0) node.innerHTML = nextE._0;
        break;
    case "Image":
	if (nextE._0.ctor === 'Plain') {
	    if (nextE._3 !== currE._3) node.src = nextE._3;
	} else if (!eq(nextE,currE) ||
		   next.props.width !== curr.props.width ||
		   next.props.height !== curr.props.height) {
	    node.parentNode.replaceChild(render(next),node);
	    return true;
	}
	break;
    case "Flow":
        var arr = fromList(nextE._1);
        for (var i = arr.length; i--; ) { arr[i] = arr[i].element.ctor; }
	if (nextE._0.ctor !== currE._0.ctor) {
	    node.parentNode.replaceChild(render(next),node);
	    return true;
	}
	var nexts = fromList(nextE._1);
	var kids = node.childNodes;
	if (nexts.length !== kids.length) {
	    node.parentNode.replaceChild(render(next),node);
	    return true;
	}
	var currs = fromList(currE._1);
	var goDir = function(x) { return x; };
	switch(nextE._0.ctor) {
	case "DDown":  case "DUp":   goDir = goDown; break;
	case "DRight": case "DLeft": goDir = goRight; break;
	case "DOut":   case "DIn":   goDir = goIn; break;
	}
	for (var i = kids.length; i-- ;) {
	    update(kids[i],currs[i],nexts[i]);
	    goDir(kids[i]);
	}
	break;
    case "Container":
	var inner = node.firstChild;
	if (!update(inner, currE._1, nextE._1)) {
	    if (nextE._0.horizontal.ctor !== currE._0.horizontal.ctor) {
		inner.style.left = inner.style.right = 'none';
		removeTransform(inner.style);
	    }
	    if (nextE._0.vertical.ctor !== currE._0.vertical.ctor) {
		inner.style.top = inner.style.bottom = 'none';
		removeTransform(inner.style);
	    }
	}
	setPos(nextE._0, nextE._1.props.width, nextE._1.props.height, inner);
	break;
    case "Custom":
	if (currE.type === nextE.type) {
	    var done = nextE.update(node, currE.model, nextE.model);
	    if (done) return;
	} else {
	    return node.parentNode.replaceChild(render(next), node);
	}
    }
    updateProps(node, curr, next);
}

function updateProps(node, curr, next) {
    var props = next.props, currP = curr.props, e = node;
    if (props.width !== currP.width)   e.style.width  = (props.width |0) + 'px';
    if (props.height !== currP.height) e.style.height = (props.height|0) + 'px';
    if (props.opacity !== 1 && props.opacity !== currP.opacity) {
	e.style.opacity = props.opacity;
    }
    var nextColor = (props.color.ctor === 'Just' ?
		     extract(props.color._0) : 'transparent');
    if (e.style.backgroundColor !== nextColor) {
        e.style.backgroundColor = nextColor;
    }
    if (props.tag !== currP.tag) { e.id = props.tag; }
    if (props.href !== currP.href) {
	if (currP.href === '') {
	    var a = newElement('a');
	    a.href = props.href;
	    a.appendChild(e);
	    e.parentNode.replaceChild(a,e);
	} else {
	    node.parentNode.href = props.href;
	}
    }
}

return { render:render, update:update };

};
ElmRuntime.Render.Utils = function() {
'use strict';

function newElement(elementType) {
    var e = document.createElement(elementType);    
    e.style.padding = "0";
    e.style.margin = "0";
    return e;
}

function addTo(container, elem) {
    container.appendChild(elem);
}

function extract(c) {
    if (c._3 === 1) { return 'rgb(' + c._0 + ',' + c._1 + ',' + c._2 + ')'; }
    return 'rgba(' + c._0 + ',' + c._1 + ',' + c._2 + ',' + c._3 + ')';
}

function addTransform(style, trans) {
  style.transform       = trans;
  style.msTransform     = trans;
  style.MozTransform    = trans;
  style.webkitTransform = trans;
  style.OTransform      = trans;
}

function removeTransform(style) {
  style.transform       = 'none';
  style.msTransform     = 'none';
  style.MozTransform    = 'none';
  style.webkitTransform = 'none';
  style.OTransform      = 'none';
}

var List = Elm.Native.List({});

return {addTo:addTo,
	newElement:newElement,
	extract : extract,
	fromList: List.toArray,
	fromString: function(s) { return List.toArray(s).join(''); },
	toString: List.fromArray,
	eq: Elm.Native.Utils({}).eq,
	addTransform: addTransform,
	removeTransform: removeTransform
	};
};
