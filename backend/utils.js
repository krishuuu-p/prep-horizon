export function getQuestionsFromDoc(docFile) {
    // return new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = (event) => {
    //         const arrayBuffer = event.target.result;
    //         const zip = new JSZip();
    //         zip.loadAsync(arrayBuffer).then((zip) => {
    //             const docText = zip.file("word/document.xml").async("string").then((text) => {
    //                 const parser = new DOMParser();
    //                 const xmlDoc = parser.parseFromString(text, "application/xml");
    //                 const questions = Array.from(xmlDoc.getElementsByTagName("w:t")).map((node) => node.textContent);
    //                 resolve(questions);
    //             });
    //         });
    //     };
    //     reader.onerror = (error) => {
    //         reject(error);
    //     };
    //     reader.readAsArrayBuffer(docxFile);
    // });
}