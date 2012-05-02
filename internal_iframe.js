/* functions utilized by the embedding iframe */

function getSize(){

  var w = $(document).width(); 
  var h = $(document).height(); 
  return {
          width: w,
          height:h
  }
}

function receiveSizeRequest(event){
  console.log('Inner: recieved communication!');
  var size = getSize();
  size.destId = event.data;
  event.source.postMessage(JSON.stringify(size), event.origin);
}

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
