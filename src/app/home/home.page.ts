import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mediaType:string = 'photos'

  constructor(private admobFree: AdMobFree, private videoEditor: VideoEditor, private file: File, public loadingController: LoadingController, public toastController: ToastController){
    this.showInterstitial()
    this.showBanner()
  }

  allMedia:any[] = []
  allPhotos:any[] = []
  photos:any[] = []
  videos:any[] = []
  vidsWithThumbs:any[] = []
  allVideos:any[] = []
  selectedMedia:any[] = []

 


  ngOnInit(){
    this.getMedia()
  }

  showBanner(){
    const bannerConfig: AdMobFreeBannerConfig = {
      isTesting: false,
      autoShow: true,
      id: ''
     };
     this.admobFree.banner.config(bannerConfig);
     
     this.admobFree.banner.prepare().then(()=>{ console.log('shown') }).catch(()=> {})
  }

  showInterstitial() {
    const interstitialConfig: AdMobFreeInterstitialConfig = {
      isTesting: false,
      autoShow: true,
      id: ''
     };
     this.admobFree.interstitial.config(interstitialConfig);
     
     this.admobFree.interstitial.prepare().then(()=>{ console.log('shown') }).catch(()=> {})
  }

  async saveMedia(){
    //copy the media from the status folder to the photo Library
    let rootDir = this.file.externalRootDirectory
    
    const loading = await this.loadingController.create({
      message: 'Saving...'
    });

    loading.present()

    console.log(this.selectedMedia)
    this.file.checkDir(this.file.externalRootDirectory, 'WhatsAppSaver')
             .then(()=> {
             const mediaLooper =  this.selectedMedia.map((media)=> {
                 this.file.copyFile(rootDir+'WhatsApp/Media/.Statuses', media, rootDir+'WhatsAppSaver', '')
                          .then(()=>{
                            return media
                          })
                          .catch(() => {
                            //display the error
                          })
               })

               Promise.all(mediaLooper)
                      .then(async ()=> {
                        loading.dismiss()
                        const toast = await this.toastController.create({
                          message: 'Saved!',
                          duration: 2000
                        });
                        toast.present();
                        this.selectedMedia = []
                      })
               
             })
             .catch(() => {
              //create the dir and copy
              this.file.createDir(rootDir, 'WhatsAppSaver', false)
                       .then(()=> {
                            const looper = this.selectedMedia.map(async (media)=> {
                              this.file.copyFile(rootDir+'WhatsApp/Media/.Statuses', media, rootDir+'WhatsAppSaver', '')
                                      .then(()=>{
                                        return media
                                      })
                                      .catch(() => {
                                        //display the error
                                      })
                            })
              
                            Promise.all(looper)
                                  .then(async ()=> {
                                      loading.dismiss()
                                      const toast = await this.toastController.create({
                                        message: 'Saved!',
                                        duration: 2000
                                      });
                                      toast.present();
                                      this.selectedMedia = []
                                  })
                       })
            })
  }

 
  markForDownload(event){
    let id = event.target.id
 
    if(event.target.checked) {

      this.selectedMedia.push(id)
    } else {
      this.selectedMedia.splice(this.selectedMedia.indexOf(id), 1)
    }
  }

  

  async refresh() {
    const loading = await this.loadingController.create({
      message: 'updating...',
      duration: 2000
    });
    loading.present()

    console.log('refresher')
    this.getMedia()
    this.showInterstitial()
    this.showBanner()
  }

  setPhotos(){
   const photoSetter = this.allPhotos.map(async(photo) => {
        this.file.readAsDataURL(this.file.externalRootDirectory+'/WhatsApp/Media/.Statuses', photo.name)
                 .then((url) => {
                  this.photos.push({url,name:photo.name})
                 })
        
    })
   
  }


  setVideos(index:number){
    console.log(this.allVideos)

    if (index === undefined) {
      index = 0
    }
    let rootDir = this.file.externalRootDirectory
   
    if (index >= this.allVideos.length) {
      return
    }

    this.videoEditor.createThumbnail({
      fileUri: rootDir+'WhatsApp/Media/.Statuses/'+this.allVideos[index].name,
      outputFileName:this.allVideos[index].name.split('.').shift()
    })
    .then((thumbUrl) => {
      
      //get dataUrl
      let tempPath = thumbUrl.split('/')
      let thumbName = tempPath.pop()
      let pathToThumb = 'file://'+tempPath.join('/')+'/'
     
     
      this.file.readAsDataURL(pathToThumb, thumbName)
               .then((vidThumb) => {
                 
                 this.videos.push({vidThumb, name:this.allVideos[index].name})
                 this.setVideos(++index)
               })
               .catch((err) => {console.log(err)})
      
    })
    
    this.showInterstitial()
    this.showBanner()
    
    
   }



  getMedia() {
    let root = this.file.externalRootDirectory
    //open the directory
    this.file.checkDir(root, 'WhatsApp/Media')
             .then(()=> {
                this.file.listDir(root, 'WhatsApp/Media/.Statuses')
                         .then((files) => {
                          const mediaMap = files.map(async (media) => {
                             let extension = media.name.split('.').pop()
                             
                             if (extension === 'mp4') {
                               this.allVideos.push(media)
                             } else {
                               this.allPhotos.push(media)
                               
                             }
                           })

                           Promise.all(mediaMap)
                                  .then(()=> {
                                    this.setPhotos()
                                  })
                         })
                         .catch(err => console.log(err))
             })
             .catch(err => console.log(err))

    //get all the files
    
    //sort images and save to array

    //sort videos and save to vids array
  }
}
