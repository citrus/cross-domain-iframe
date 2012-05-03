/* functions utilized by the embedding iframe */


function getSize(){

  var w = $(document).width(); 
  var h = $(document).height(); 
  return {
          width: w,
          height:h
  };
}

/* queue the last received message,
 * respond to it when ready (callback sendSizeResponse), 
 * or queue up a response function before any message
 */

var incomingMessage = null;
var respondFunction = null;

function sendSizeResponse(){
  if(incomingMessage == null){
    // wait for later message
    respondFunction = sendSizeResponse;
    return;
  }
  var size = getSize();
  size.destId = incomingMessage.data;
  incomingMessage.source.postMessage(JSON.stringify(size), incomingMessage.origin);
}

function receiveSizeRequest(event){
  // queue the last recieved message
  incomingMessage = event;
  if(respondFunction)
    respondFunction();
}

/* **************************************************************************
 * For this example the iframe is ready immediately, we have no callback
 * so prime the response :
 * **************************************************************************
  */

respondFunction = sendSizeResponse;

/****************************************************************************/

try{
    window.addEventListener("message",receiveSizeRequest, false);
}
catch(e){
  // assume that the window lacks this support, IE8 and less?
  $(document).ready(function(){
    var size = getSize();
    window.location.hash = size.width + "-" + size.height;
  });
}
