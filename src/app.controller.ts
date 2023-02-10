import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream, readFileSync } from 'fs';
import { join } from 'path';
var fs=require('fs');
var  xml2js =require('xml2js')

@Controller()
export class AppController {
  async convertXMLtoJS(file) {
    const xmlData = await fs.readFileSync(file, 'utf-8');
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async convertJStoXML(jsData) {
    const builder = new xml2js.Builder();
    return builder.buildObject(jsData);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async compareXML(@UploadedFiles() files, @Res() res) {
    
    const obj1 = await this.convertXMLtoJS(files[0].originalname);
  
    const obj2 = await this.convertXMLtoJS(files[1].originalname);

    let result = await this.compareXML2(obj1, obj2);

    const xml = await this.convertJStoXML(result);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=compared.xml');

    return res.send(xml)

  }

  async compareXML2(xml1, xml2) {
   // console.log(xml1.root.element[0]);
    
    const xml1Elements = xml1.root.element;
    const xml2Elements = xml2.root.element;
    
    xml2Elements.forEach((xml2Element) => {
      
      const xml1Element = xml1Elements.find(
        (element) => element.value[0] === xml2Element.value[0]
      );
      if (xml1Element) {
        xml2Element.occurrence = "both";
      } else {
        xml2Element.occurrence = "2";
      }
    });
  
    xml1Elements.forEach((xml1Element) => {
      const xml2Element = xml2Elements.find(
        (element) => element.value[0] === xml1Element.value[0]
      );
      if (!xml2Element) {
        xml1Element.occurrence = '1';
      }
    });
  
    return xml2;
  }
}