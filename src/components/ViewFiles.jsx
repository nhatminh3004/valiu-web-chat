import React, { useState } from "react";
import ImageViewer from 'react-simple-image-viewer';
// import PdfViewerComponent from "../utils/PdfViewerComponent";
import { Document, Page, pdfjs  } from 'react-pdf';
import styled from "styled-components";
import { AiOutlineClose } from "react-icons/ai";

function ViewFiles({files, currentImage, isViewerOpen, closeImageViewer}) {
    let urlImage = [];
    let pdfFile = [];
    for(var i = 0; i < files.length; i++) {
        var parts = files[i].url.split(".");
        const fileType = parts[parts.length - 1];
        if (fileType === "jpg" || fileType === "jpeg" || fileType === "png")
            urlImage = [...urlImage, files[i].url];
        else if (fileType === "pdf")
            pdfFile = [...pdfFile,  files[i].url];
    }
    pdfjs.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }
    function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
      }
    
      function previousPage() {
        changePage(-1);
      }
    
      function nextPage() {
        changePage(1);
      }
    return isViewerOpen && <Container>
        <div className="icon-container" onClick={() => { setNumPages(0); closeImageViewer();}}><AiOutlineClose /></div>
        {
                    
            isViewerOpen && urlImage.length > 0 && 
                (
                    <ImageViewer
                    src={ urlImage }
                    currentIndex={ currentImage }
                    disableScroll={ false }
                    closeOnClickOutside={ true }
                    onClose={ closeImageViewer }
                    />
                )   
        }
        { isViewerOpen && pdfFile.length > 0 &&
            <div className="filepdf-container">
                <Document file={`${pdfFile[0]}`} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
                <div className="page-controll-container">
                    <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
                    Previous
                    </button>
                    <p className="page-number">
                    Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
                    </p>
                    <button
                    type="button"
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                    >
                    Next
                    </button>
                </div>
            </div>
            // <div className="PDF-viewer">
            //     <PdfViewerComponent
            //         document={`${files[0]}`}
            //     />
            // </div>
        }
    </Container>;
}
const Container = styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
    z-index: 1;
    .icon-container {
        position: absolute;
        right: 0.5rem;
        top: 0.5rem;
        svg {
            font-weight: bold;
            font-size: 1.5rem;
            color: #fff;
        }
    }
    .filepdf-container {
        .react-pdf__Document {
            max-height: 90vh;
            .react-pdf__Page {
                max-height: 100%;
                .react-pdf__Page__canvas {
                    max-height: 90vh;
                }
                .react-pdf__Page__textContent {
                    max-height: 90vh;
                }
            }
        }
        .page-controll-container {
            padding-top: 0.5rem;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }
    .page-number {
        color: #fff;
    }
`;
export default ViewFiles;
