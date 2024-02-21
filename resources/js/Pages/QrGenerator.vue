<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';

import { ref, onMounted, nextTick } from 'vue';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';

const qrCodes = ref([]);
    let selectedBackgroundImage = null;
    let initialOffset = { x: 0, y: 0 };
    const domToCapture = ref(null);
    const imageUrl = ref('');
    const downloadPercentage = ref(0);


    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      const fileData = await parseExcel(file);

      const qrCodePromises = fileData.map(async (row) => {
        const textData = JSON.stringify(row[1]);
        const qrDataURL = await generateQRCode(textData);
        return { qrDataURL, position: { x: 0, y: 0 }, scale: 1 };
      });

      qrCodes.value = await Promise.all(qrCodePromises);
    };

    const parseExcel = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData.slice(1));
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsArrayBuffer(file);
      });
    };

    const generateQRCode = async (textData) => {
      try {
        const qrDataURL = await QRCode.toDataURL(textData);
        return qrDataURL;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    const chooseBackgroundImage = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event) => {
        selectedBackgroundImage = event.target.files[0];
        await addBackgroundImage();
      };
      input.click();
    };

    const addBackgroundImage = async () => {
      for (let i = 0; i < qrCodes.value.length; i++) {
        const qrCode = qrCodes.value[i];
        if (selectedBackgroundImage) {
          qrCode.backgroundImage = await mergeBackground(selectedBackgroundImage);
        }
      }
      qrCodes.value = [...qrCodes.value];
    };

    const mergeBackgroundFromURL = (imageUrl) => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();

        image.crossOrigin = 'Anonymous'; // Enable cross-origin for image
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        image.onerror = (error) => {
          console.error('Error loading background image:', error);
          reject(error);
        };

        image.src = imageUrl;
      });
    };

    const mergeBackground = (backgroundImage) => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();

        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        image.onerror = (error) => {
          console.error('Error loading background image:', error);
          reject(error);
        };

        image.src = URL.createObjectURL(backgroundImage);
      });
    };

    const downloadZip = async () => {
      const zip = new JSZip();
      let filesProcessed = 0;
      const totalFiles = qrCodes.value.length;
      qrCodes.value.forEach((qrCode, index) => {
        console.log(index)
        zip.file(`Invite_${index + 1}.png`, qrCode.qrDataURL.split('base64,')[1], { base64: true });
        filesProcessed++;
        downloadPercentage.value = Math.floor((filesProcessed / totalFiles) * 100);
        if (filesProcessed === totalFiles) {
          nextTick(() => {
            downloadPercentage.value = 0; // Reset percentage after download is complete
          });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([content], 'QR_Codes.zip', { type: 'application/zip' });
      const url = URL.createObjectURL(zipFile);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'QR_Codes.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const downloadWithBackground = async () => {
      if (!domToCapture.value) {
        console.error('Error: domToCapture is null.');
        return;
      }

      const zip = new JSZip();
      let filesProcessed = 0
      let totalFiles = qrCodes.value.length;
      for (let i = 0; i < qrCodes.value.length; i++) {
        const qrCode = qrCodes.value[i];
        if (qrCode.backgroundImage) {
          const qrCodeElement = domToCapture.value.children[i];
          const canvas = await html2canvas(qrCodeElement);
          const imageData = canvas.toDataURL('image/png').split('base64,')[1];
          zip.file(`Invite_${i + 1}_with_background.png`, imageData, { base64: true });
          filesProcessed++;
          downloadPercentage.value = Math.floor((filesProcessed / totalFiles) * 100);
          if (filesProcessed === totalFiles) {
            nextTick(() => {
              downloadPercentage.value = 0; // Reset percentage after download is complete
            });
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([content], 'QR_Codes_with_Background.zip', { type: 'application/zip' });
      const url = URL.createObjectURL(zipFile);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'QR_Codes_with_Background.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleMouseDown = (event, index) => {
      startDrag(event, index);
    };

    const handleMouseUp = (event, index) => {
      endDrag();
    };

    const startDrag = (event, index) => {
      initialOffset.x = event.clientX - qrCodes.value[index].position.x;
      initialOffset.y = event.clientY - qrCodes.value[index].position.y;

      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', endDrag);
    };

    const handleDrag = (event) => {
      qrCodes.value.forEach((qrCode, index) => {
        qrCode.position.x = event.clientX - initialOffset.x;
        qrCode.position.y = event.clientY - initialOffset.y;
      });
    };

    const endDrag = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
    };

    const handleMouseScroll = (event, index) => {
      const delta = Math.sign(event.deltaY);
      const scaleFactor = 1.1;
      const qrCode = qrCodes.value[index];
      qrCode.scale = qrCode.scale || 1;

      if (delta > 0) {
        qrCode.scale /= scaleFactor;
      } else {
        qrCode.scale *= scaleFactor;
      }

      qrCodes.value.forEach((code) => {
        code.scale = qrCode.scale;
      });

      qrCodes.value = [...qrCodes.value];
    };

    const changeBackgroundImage = async () => {
      if (!imageUrl.value) {
        console.error('Error: Image URL is empty.');
        return;
      }

      const selectedImageUrl = imageUrl.value;

      for (let i = 0; i < qrCodes.value.length; i++) {
        const qrCode = qrCodes.value[i];
        qrCode.backgroundImage = await mergeBackgroundFromURL(selectedImageUrl);
      }

      qrCodes.value = [...qrCodes.value];
    };
    onMounted(() => {
      const qrImages = document.getElementsByClassName('qr-image');
      for (let i = 0; i < qrImages.length; i++) {
        qrImages[i].style.position = 'absolute';
      }
      domToCapture.value = document.querySelector('.flex-wrap');
    });
</script>

<template>
  <AppLayout title="QR Generator">
        
  <div class="p-4">
    <div class="flex flex-col items-center justify-center">
      <div class="flex items-center justify-center w-full p-4">
        <label for="dropzone-file"
          class="flex items-center text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg px-5 py-2.5 me-2 mb-2">
          <div class="flex flex-col items-center justify-center pt-2 pb-2 pl-2 pr-2">
            <svg class="w-8 h-8 mB2 text-gray-500 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2">
              </path>
            </svg>
            <p class="text-xs text-gray-500 text-white"><strong>Upload Excel File</strong></p>
          </div>
          <input id="dropzone-file" type="file" class="hidden" @change="handleFileUpload" />
        </label>

        <button @click="downloadZip" type="button"
          class="flex items-center text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Download QR Codes as ZIP
          <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"></path>
          </svg>
        </button>

        <input v-model="imageUrl" type="text" placeholder="Enter Image URL"
          class="rounded-l-lg px-4 py-2 border-t border-b border-l text-gray-800 border-gray-200 bg-white" />
        <button @click="changeBackgroundImage" type="button"
          class="flex items-center text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Change Background Image Using URL
        </button>

        <button @click="chooseBackgroundImage" type="button"
          class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Choose Background Image in Local Files
        </button>

        <button @click="downloadWithBackground" type="button"
          class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Download with Background
        </button>
      </div>

      <div class="mb-5 w-100 max-w-7xl mx-auto" >
        <div v-if="downloadPercentage != 0">
        <div class="flex justify-between mb-1">
          <span class="text-base font-medium text-blue-700">Download Progress</span>
          <span class="text-sm font-medium text-blue-700">{{ downloadPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: downloadPercentage + '%' }"></div>
        </div>
      </div>


        <div>
          <div ref="domToCapture" v-if="qrCodes.length > 0" class="bg-blue-200 grid grid-cols-3">
            <div v-for="(qrCode, index) in qrCodes" :key="index" class="relative inline mx-2 my-2">
              <img :src="qrCode.backgroundImage" alt="Background" class="imgbg" />
              <div class="qr-code" :style="{
                left: qrCode.position.x + 'px',
                top: qrCode.position.y + 'px',
                transform: `scale(${qrCode.scale || 1})`,
                width: qrCode.backgroundWidth + 'px',
                height: qrCode.backgroundHeight + 'px',
              }" 
              @mousedown="handleMouseDown($event, index)" @mouseup="handleMouseUp($event, index)"
                @wheel.prevent="handleMouseScroll($event, index)">
                <img :src="qrCode.qrDataURL" alt="QR Code" class="qr-image w-20 h-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </AppLayout>
</template>

<style>
.row-container {
  display: flex;
  flex-wrap: wrap;
}

/* .qr-container {
  display: inline-block;
} */

.qr-code {
  position: absolute;
  margin: 10px;
  width: 5rem;
  height: 5rem;
  background-size: contain;
  cursor: pointer;
}

.qr-image {
  position: relative;
  /* width: 100px;
  height: 100px; */
  pointer-events: none;
}

.doms {
  background-repeat: no-repeat;
  object-fit: cover;
}
</style>
 