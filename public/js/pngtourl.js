onmessage = function(e){
    try {
        
        let fr = new FileReader();
        fr.onload = (event)=>{
            console.log(event.target.result, e.data[1]);
            postMessage([event.target.result, e.data[1]]);
        }
        fr.readAsDataURL(e.data[0]);
        
    } catch (error) {
        console.log(error)
      this.postMessage(null);   
    }
}