# VDomSrc

VDomSrc 是 Lightue 使用来生成 VDom 和真实 DOM 节点的一种特殊结构。它可以有以下这些形式：

## string | number

展示一个简单 div 元素并将字符串或数字作为内容。你可以将它当成是只有 `$$ (string | number)` 的对象的简写

## Array

它将会生成一个容器元素。数组中的每个元素会被作为 VDomSrc 解析并将结果个个 append 到容器中。可以将它看成是只有 `$$ (Array)` 的对象的简写

## Object

这是 VDomSrc 最重要的结构。它会被渲染成一个 DOM 元素，它里面的一些特殊属性将会被特殊处理：

### $class (object)

是一个对象声明当前元素含有的类名。对象中的键是单个类名，值是布尔值，表示是否添加这个类名

### $tag (string)

声明元素的标签名，如 'div', 'span', 'input'。省略时默认为 'div'

### $value

对于 input，textarea 和 select 元素， `$value` 会设置它们的 value 属性。注意这跟设置 `_value` 不同， `_value` 仅仅设置 html 标签属性而非 DOM 实例属性

### $checked

对于 checkbox 或 radio 类型的 input 元素， `$checked` 会设置它们 DOM 实例的 checked 属性

### $cleanup

设置当元素即将被移除时调用的函数。常常包含类似 `clearInterval` 的操作

### \$$(Array)

当有一个 `$$` 属性且值为数组时，数组中每个元素被作为 VDomSrc 解析，并将结果个个 append 到当前元素

### \$$\*(Object)

当有一个 `$$` 开头的属性且值为对象时，它会被作为 VDomSrc 解析，结果会被 append 到当前元素

### \$$\* (string | number)

当有一个 `$$` 开头的属性且值为字符串或数字时，它会被渲染成一个文本节点

### \$\_\*

当一个属性以 `$_` 开头时，会创建一个子元素并默认为 `span` 元素。属性里 \* 会被用作子元素类名。值会被作为 VDomSrc 解析

### \_\*

当一个属性以 `_` 开头时，它的值会被放到短横杠化的 HTML 属性上。如 `_dataSrc` 属性的值会被放到 `data-src` HTML 属性上

### on\*

它用来设置元素的事件监听器。它会被原生 `addEventListener` 添加到当前元素上。

### \* (not starts with `$`, `_` or `on`)

其他情况下属性名不以 `$`, `_` 或 `on` 开头时，会产生一个标签默认为 div 的子元素。短横杠化的属性名会被作为元素的类名。值会被作为 VDomSrc 解析
