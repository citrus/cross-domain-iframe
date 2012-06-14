/**
 * given a URL parses out just the protocol://host origin 
 */
function getTargetOrigin(url){

  var anchor = document.createElement("a");
  anchor.href = url;
  var resourcePath = anchor.pathname + anchor.hash;
  
  // create the regular expression, we need to escape the slashes
  var pathRE = RegExp(resourcePath.replace(/\//g, '\\\/'));

  // eliminate the path componant and return
  return url.replace(pathRE, '');

}

/**
 * Embeds ''url'' in an iframe after the element with the given ''id''
 *
 * Resizes the iframe to be the size of the containing content.
 */
function embedDataOutput(url, id){

  var targetOrigin = getTargetOrigin(url);
  // we reserve the hash for communication
  var frameSrc = url.replace(/#.*/,'');

  function init() {
    if (arguments.callee.done) return;
    arguments.callee.done = true;

    // do your thing
    var parentEl = document.getElementById(id);

    var frame = document.createElement('iframe');
    var frameId = id + "-iframe";
    frame.frameBorder = "0";
    frame.scrolling="no";
    frame.id = frameId;
    frame.src = frameSrc;
    frame.style.width = "0px";
    frame.style.height = "0px";
    var self = this;

    var frameInit = function(){
      /* build the iframe set the correct size:
       *
       * There are two possible ways to recieve a message from the foreign
       * iframe. First, we can simply trigger a cross domain message event, 
       * secondly we can set the hash fragment on the foreign iframe and poll
       *
       * */

      function receiveMessage(event){
        // recieve a message event and set the size of the iframe

        // strip trailing slashes
        var remoteOrigin = event.origin.replace(/\/$/, '')
        var localOrigin = targetOrigin.replace(/\/$/, '')

        if (remoteOrigin !== localOrigin){
          return
        }

        var data = null;
        if(this['JSON']){
          data = JSON.parse(event.data);
        }
        else{
          data = eval(event.data);
        }

        if (data.destId !== frameId){
          return
        }
        frame.style.width = data.width + "px";
        frame.style.height = data.height + "px";
      }

      function pollMessage(){
        // Unable to use the dom message event,
        // Poll until the hash is set on the child iframe, 
        
        var frame = document.getElementById(frameId)
        var hash = frame.contentWindow.location.hash;
        if(hash){
          hash = hash.replace(/#/,'')
          var hashDims = hash.split('-');
          frame.style.width = hashDims[0] + "px";
          frame.style.height = hashDims[1] + "px";
        }
        else{
          setTimeout(pollMessage, 800)
        }
      }

      try{
        if(window.attachEvent){
          window.attachEvent("onmessage", receiveMessage);
        }
        else{
          window.addEventListener("message", receiveMessage, false);
        }
      }
      catch(e){
        // start polling!
        throw('AAA!')
        pollMessage();
      }
      finally{
        frame.contentWindow.postMessage(frameId, targetOrigin)
      }

    };// end frameInit


    // Listen for load events and then init the frame
    if (frame.addEventListener) {
      frame.addEventListener('load', frameInit, false);
      // IE 
    } else if (frame.attachEvent) {
      frame.attachEvent('onload', frameInit);
    }

    // Here we go!
    parentEl.appendChild(frame);

  } //end init
  
  // start loading the iframe immediately 
  // ensure the target dom el comes before this script
  // otherwise, call init() when the DOM is ready
  init();
}

