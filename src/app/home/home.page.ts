import { Component, OnInit } from '@angular/core';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private file: File){
    
  }

  allMedia:any[] = []
  allPhotos:any[] = []
  photos:any[] = []
  allVideos:any[] = []
  selectedMedia:any[] = []

 


  ngOnInit(){
    this.getMedia()
  }

  saveMedia(){
    //copy the media from the status folder to the photo Library
    
  }

 
  markForDownload(event){
    let id = event.target.id
    this.selectedMedia.push(id)
  }

  

  refresh() {
    console.log('refresher')
    this.getMedia()
  }

  setPhotos(){
   const photoSetter = this.allPhotos.map(async(photo) => {
        this.file.readAsDataURL(this.file.externalRootDirectory+'/WhatsApp/Media/.Statuses', photo.name)
                 .then((url) => {
                  this.photos.push({url,name:photo.name})
                 })
        
    })
   
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
