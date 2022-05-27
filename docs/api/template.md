# VDomSrc

The VDomSrc is a special structure used by Lightue to generate VDom(Lightue virtual DOM) and also generate real DOM nodes. It can have several different shapes:

- string | number
  > Render a simple div element with the string or number as content. You can see this as a shortcut to Object which only has `$$ (string | number)`
- Array
  > This will generate a wrapper element. Each item in the array is parsed as a VDomSrc and the results are appended in the wrapper one by one. You can see this as a shortcut to Object which only has `$$ (Array)`
- Object
  > This is the most crucial part of the VDomSrc structure. It will be rendered to a DOM element, and it has some special keys that are handled specially:
  - $class (object)
    > This specifies classes of the current element. The key is the class name, and the value is boolean indicating whether to add the class
  - $tag (string)
    > This is the tag name of the element, such as 'div', 'span', 'input'. When omitted, it is 'div' by default
  - $value
    > For input, textarea and select elements, `$value` will set their value property. Note this is different from setting `_value` which only sets the html attribute
  - $checked
    > For input elements whose type is checkbox or radio, `$checked` will set their checked property.
  - $cleanup
    > Sets the function which will be called when the element is about to be removed from document. Usually contains something like `clearInterval`
  - \$$(Array)
    > When there is a `$$` property and it's value is of type Array, each item in the array is parsed as a VDomSrc and the results are appended in current element one by one
  - \$$(Object)
    > When there is a `$$` property and it's value is of type Object, it will be treated as a VDomSrc and the result will append in current element
  - \$$\* (string | number)
    > When there is a property starts with `$$` and the value is of type `string | number` it will be rendered to a text node
  - \$\_\*
    > When the property name starts with `$_`, it means to create a child element with a default `span` $tag. And the following \* in the property name is used as the element class. The value is treated as a VDomSrc
  - \_\*
    > When a property starts with `_`, it's value will be assigned to the hyphenated version attribute. For example, `_dataSrc` property assigned to `data-src` attribute
  - on\*
    > This is the event listener on the element. It will be added to the element using native `addEventListener`.
  - \* (not starts with `$`, `_` or `on`)
    > In other cases when property name does not starts with `$`, `_` or `on`, it will create a child element with a default `div` $tag. And the property name is used as the element class. The value is treated as a VDomSrc