
```
___________               ________.____                
\_   _____/___________   /  _____/|    |               
 |    __) \_  __ \__  \ /   \  ___|    |       ______  
 |     \   |  | \// __ \\    \_\  \    |___   /_____/  
 \___  /   |__|  (____  /\______  /_______ \           
     \/               \/        \/        \/           
________  .__               .__                        
\______ \ |__| ____________ |  | _____    ____  ____   
 |    |  \|  |/  ___/\____ \|  | \__  \ _/ ___\/ __ \  
 |    `   \  |\___ \ |  |_> >  |__/ __ \\  \__\  ___/  
/_______  /__/____  >|   __/|____(____  /\___  >___  > 
        \/        \/ |__|             \/     \/    \/  
```
---

Webgl plugin for layered, displaced images using the fragl lib.


# Usage
  

```javascript
    import Displace from 'fragl-displace';

    import bgDisp from '+/images/bg-disp.jpg';
    import bg from '+/images/bg.jpg';

    import fgDisp from '+/images/fg-disp.jpg';
    import fgMask from '+/images/fg-mask.jpg';
    import fg from '+/images/fg.jpg';

    const canvas = document.querySelector('.canvas');
    const imageSize = { // this is to get the ratio for sizing the images
        width:1920,
        height:1080
    }
    const args = {
        canvas,
        imageSize
    }

    const displace = new Displace(args)

    displace.addLayer({
        displace:bgDisp,
        main:bg
    })

    displace.addLayer({
        displace:fgDisp,
        main:fg,
        mask:fgMask
    })


    // stop and start again
    displace.stop()
    displace.start()
    

```

An example of a depth map to use as a displacement image :
<https://www.researchgate.net/profile/Gwang_Park/publication/220235505/figure/fig1/AS:378614760656897@1467280201631/Real-image-and-its-depth-map-in-Ballet-sequence.png>

<br>
If you wish to mask out a layer use a black and white image,  black will be full transparency.
<br>


That's it...
