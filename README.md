# About
chili-postmessage project consists of two small scripts to wrap common CHILI editorObject methods around postMessages.

There are two main parts to this project:
- PostMessageWrapper - which needs to be run CHILI side
- EditorPostObject - which needs to be run on your app side

However, EditorPostObject is not really necessary as you can interface directly with ``window.postMessage``. Likewise, you could simply remove the logic from PostMessageWrapper and run your own message listener. However, both classes are provided because they are tested and production ready for the four main CHILI use cases:
- GetObject
- SetProperty
- ExecuteFunction
- AddListener

## Motivation
CHILI publisher is required to be run in an iframe, which means that if you want to interact with the CHILI Editor you will need to follow the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy "same-origin policy") and have the parent window and iframe run on the same domain. However, in some instances this is not possible, such as running CHILI publisher on a third-party platform. In addition, the subdomain JavaScript trick using [document.domain](https://developer.mozilla.org/en-US/docs/Web/API/Document/domain "document.domain") to workaround the same-origin policy has recently been deprecated. Therefore, these scripts can be used in such environments.

# Project Installation
There are two options to install, you can use NPM or download the source on [Github](https://github.com/seancrowe/chili-postMessage "Github") and build the scripts.

## NPM
Downloading from NPM is super simple.
```
npm install chili-postmessage
```

At which point you have access to either prebundled classes or classes ready for your next project.

### Prebundled
You can find the prebundled scripts in the ``www/dist`` directory of the downloaded npm package. The typical location is (assuming root folder of your project):
```
./node_modules/chili-postmessage/www/dist
```

<br/>
You will find the two prebundled scripts:

- postMessageWrapper.js
- editorPostObject.js

You can use these scripts directly in an HTML page with the ``<script>`` tag. For example,
```html
<script src="./node_modules/chili-postmessage/www/dist/editorPostObject.js" type="text/javascript"></script>
```

Although typically, you will want to copy these files from this location to a better location for your web application.

```html
<script src="./scripts/editorPostObject.js" type="text/javascript"></script>
```

### Next Project
If you want to bundle things yourself, you can use both classes by simply importing them into your project.

Importing PostMessageWrapper
```javascript
import {PostMessageWrapper}  from "chili-postmessage";
```

Importing EditorPostObject
```javascript
import {EditorPostObject}  from "chili-postmessage";
```

## Source
You can clone or download the [Github](https://github.com/seancrowe/chili-postMessage "Github").

You need to install dependencies with the NPM install command:
```
NPM install
```

You can then build the project with the following:
```
NPM run build
```

# Using PostMessageWrapper
PostMessageWrapper.js contains the most important part to using postMessages. Therefore, it is important to use this correctly.

The PostMessageWrapper class has a static method ``PostMessageWrapper.setupEventListeners(editorObject)``. This class must be called on document load. You have two options to achieve this goal:
- Inject the script into the editor_html.aspx page utilizing a proxy server
  - This is not described here
  - To do this, you will need to wait until window.editorObject is not null
- Utilize [Document Actions](https://chilipublishdocs.atlassian.net/wiki/spaces/CPDOC/pages/1412117/Getting+Started+with+Document+Actions "Document Actions") to run the script in the document template

Unfortunately, to respect CHILI publish wishes, I cannot fully describe how to utilize the Document Actions to implement this JavaScript. However, there is a very short video which describes this process. You may go to [spicy-labs](http://spicy-labs.com/ "spicy-labs") to request access to that video.

However, the gist is that we need the following JavaScript to run in the document template.

You can hardcode the JavaScript directly. **Not recommended**
```javascript
import {PostMessageWrapper}  from "chili-postmessage";
PostMessageWrapper.setupEventListeners(window.editorObject);
```

Where the editorObject is the JavaScript interface object provided to us on the window by the CHILI Editor.

If you are using the prebundled script, we would to copy and paste the script into our code:
```javascript
/* Copy and pasted script from postMessageWrapper.js */
window.postMessageWrapper.setupEventListeners(window.editorObject);
```

<br/>

However, a potentially a more powerful option would be load the script externally using JavaScript to add a ``<script>`` tag pointing to an external version of this postMessageWrapper.js script.

This is suggested for two big reasons:
* It allows you to avoid hardcoded JavaScript, so that changes to postMessageWrapper.js will be pushed to all documents.
* It makes it easy to modify documents on document load in the Editor to include this document Action.

Instead of hardcoded JavaScript, our new Document Action would create a script tag pointing to our JavaScript on an external server serving the file over HTTPS.
```javascript
let tag = document.createElement("script");
tag.src = "https://hostingthewrapper.example.com/setupWrapper.js";
document.getElementsByTagName("head")[0].appendChild(tag);
```

<br/>
The JavaScript, whether hardcoded or on an external endpoint, will be the same. The difference is where it is being loaded.

# Using EditorPostObject
PostMessageWrapper is meant to run CHILI side, while EditorPostObject is meant to run on your app side.

If using the prebundled editorPostObject.js, you will find the EditorPostObject class on the window. If using the non-bundled class, you can import the class using the import from syntax.
Using prebundled editorPostObject.js
```html
<script src="./scripts/editorPostObject.js" type="text/javascript"></script>
<script type="text/javascript">
  const EditorPostObject = window.EditorPostObject;
</script>
```

Using non-bundled EditorPostObject
```javascript
import {EditorPostObject}  from "chili-postmessage";
```

## Constructor
Once we have the class, we will need to construct a new instance of EditorPostObject. The constructor method takes two parameters:
- the HTMLFrameElement object of your CHILI Editor running in an iframe
- (optional) parent window where the addEventListener will be subscribed to - in most cases this not set

Assuming the CHILI Editor is being loaded in an iframe with the id "editor-iframe", you would typically create a new instance like so:
```javascript
const iframe = document.querySelector("#editor-iframe");

iframe.addEventListener("load", (e) =>{

  const editorPostObject = new EditorPostObject(e.target);

});
```

## GetObject
GetObject method takes a single parameter, a CHILIpath string.

The method returns a ``Promise<any>``.

Below we are getting the document zoom.
```javascript
editorPostObect.GetObject("document.zoom").then((result)=>{ console.log(result) });
```

Using await syntax
```javascript
const result = await editorPostObect.GetObject("document.zoom");
console.log(result);
```

## SetProperty
Getting is fun, but sometimes we want to set properties. The SetProperty method has three parameters:
- string -takes a CHILIpath
- string - the name of the property
- string|number|boolean - value to set the property

The method returns a ``Promise<any>``, however you rarely use the return value except for knowing when the property is done being set.

Here we are setting the document zoom. We do not care about the return value.
```javascript
editorPostObect.SetProperty("document", "zoom", 60);
```

## ExecuteFunction
ExecuteFunction method had three parameters:
- string - CHILIpath to the object
- string - name of the function
- REST - parameters for the function

The method returns a ``Promise<any>``.

Here we are added a new frame.
```javascript
editorPostObject.ExecuteFunction('document.pages[0].frames', 'Add', 'text', '10 mm', '10 mm', '100 mm', '50 mm');
```

Saving a document
```javascript
editorPostObject.ExecuteFunction('document', "Save");
```

## AddListener
AddListener is a different method as you supply and event and a callback function.
- string - event name
- Function - callback function

**Limitation!** Right now it is impossible to get the id of the target that raised the event due to CHILI's JavaScript obfuscation. There is nothing that can be done to fix this.

Add an event for SelectedFrameChanged
```javascript
editorPostObject.AddListener("SelectedFrameChanged", ()=>{
  console.log("frameChanged");
});
```






