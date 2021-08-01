import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('inputFile', { static: true }) inputFile: ElementRef;

  // Defining of variables
  url: any;
  errorMsg = '';
  submitted = false;
  successMsg = false;
  lineSelected = false;
  erase = false;

  shapes: any = [];
  stage: Konva.Stage;
  layer: Konva.Layer;

  // Defining of Konva.Line
  line(pos: any, mode: string = 'brush') {
    return new Konva.Line({
      stroke: '#000',
      strokeWidth: 2,
      globalCompositeOperation:
        mode === 'brush' ? 'source-over' : 'destination-out',
      points: [pos.x, pos.y],
      draggable: false,
    });
  }

  constructor(private appService: AppService) {}

  // HostListener on function for resizing width and height of Konva.Stage
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (!this.shapes || this.shapes.length === 0) {
      this.stage.width(event.target.innerWidth - 100);
      this.stage.height(event.target.innerHeight - 300);
    }
  }

  ngOnInit() {
    // Defining of Konva.Stage and Konva.Layer
    this.stage = new Konva.Stage({
      container: 'container',
      width: innerWidth - 100,
      height: innerHeight - 300,
    });
    this.layer = new Konva.Layer();

    // Adding layer into stage
    this.stage.add(this.layer);

    // Calling function for drawing line
    this.addLineListeners();
  }

  // Function for changing state of lineSelected boolean, called in HTML on button Draw Line
  addLine(): void {
    this.lineSelected = true;
  }

  // Function for drawing line, called in ngOnInit
  addLineListeners(): void {
    let isPaint: boolean;
    let lastLine: any;

    // Start of drawing line
    this.stage.on('mousedown touchstart', () => {
      if (!this.lineSelected && !this.erase) {
        return;
      }
      // Setting submitted and successMsg back to false when starting draw again
      this.submitted = false;
      this.successMsg = false;

      // Setting line parameters and adding it into layer
      isPaint = true;
      const pos = this.stage.getPointerPosition();
      const mode = this.erase ? 'erase' : 'brush';
      lastLine = this.line(pos, mode);
      this.shapes.push(lastLine);
      this.layer.add(lastLine);
    });

    // Stop of drawing line
    this.stage.on('mouseup touched', () => {
      isPaint = false;
    });

    // Drawing line
    this.stage.on('mousemove touchmove', () => {
      if (!isPaint) {
        return;
      }

      // Setting submitted and successMsg back to false when starting draw again
      this.submitted = false;
      this.successMsg = false;

      // Setting line parameters and adding it into layer
      const pos = this.stage.getPointerPosition();
      const newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
      this.layer.batchDraw();
    });
  }


  // Function for adding image into layer, called in HTML on button Choose Image
  selectFile(event: any): void {
    // Setting submitted and successMsg back to false when adding new image
    this.submitted = false;
    this.successMsg = false;

    // Creating img and defining its URL
    const URL = webkitURL || window.URL;
    const innerUrl = URL.createObjectURL(event.target.files[0]);
    const img = new Image();
    img.src = innerUrl;

    // For onloading img and adding it into layer
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      const max = 300;
      const ratio = imgWidth > imgHeight ? imgWidth / max : imgHeight / max;

      // For resizing width and height of Konva.Stage based on image´s size
      this.stage.width(imgWidth / ratio);
      this.stage.height(imgHeight / ratio);

      // Defining Konva.Image
      const theImg = new Konva.Image({
        image: img,
        x: 0,
        y: 0,
        width: imgWidth / ratio,
        height: imgHeight / ratio,
        draggable: false,
      });

      // Clearing errorMsg
      this.errorMsg = '';

      // Adding image into layer
      this.shapes.push(theImg);
      this.layer.add(theImg);
      this.stage.add(this.layer);
    };

    // Defining error message
    const type = event.target.files[0].type;
    if (type.match(/image\/*/) === null) {
      this.errorMsg = 'You can upload only image.';
      return;
    }
  }

  // Function for sending POST HTTP request, called in HTML on button Send Image
  onSendImage(): void {
    this.appService.sendImage(this.stage.toDataURL()).subscribe(() => {
      try {
        // Setting submitted and successMsg back to true
        this.submitted = true;
        this.successMsg = true;
      } catch (err) {
        throw new Error('Something went wrong, try it again.');
      }
    });
  }

  // Function for clearing stage, called in HTML on button Clear All
  clearStage(): void {
    // Setting submitted and successMsg back to false
    this.submitted = false;
    this.successMsg = false;
    // Clearing shapes array
    this.shapes = [];
    // Clearing layer
    this.layer.destroyChildren();
    this.layer.clear();
    // Clearing of file input
    this.inputFile.nativeElement.value = '';
  }

  // Function for enabling downloading image
  downloadURI(uri: string, name: string): void {
    // Creating a href with download
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    // Clicking on a 'a' and removing it
    link.click();
    link.parentNode.removeChild(link);
  }

  // Function for downloading image/stage, called in HTML on button Download Image
  onDownloadImage(): void {
    const dataUrl = this.stage.toDataURL({ pixelRatio: 3 });
    this.downloadURI(dataUrl, 'image.png');
  }
}
