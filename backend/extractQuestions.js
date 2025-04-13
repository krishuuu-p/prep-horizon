// extractQuestions.js
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const { XMLParser } = require('fast-xml-parser');

const IMAGE_DIR = "extracted_images";
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR);

async function extractTextWithImageMarkers(filePath) {
    const buffer = fs.readFileSync(filePath);
    const { value: text } = await mammoth.extractRawText({ buffer });
    return text.replace(/\n{2,}/g, "\n").trim();
}

async function extractImagesFromDocx(filePath,testId) {
    const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
    // console.log(zip)
    const imageMap = [];
    const docXml = await zip.files["word/document.xml"].async("text");
    const relsXml = await zip.files["word/_rels/document.xml.rels"].async("text");

    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlData = parser.parse(docXml);
    const relsData = parser.parse(relsXml);

    
    let imageCounter = 1;
    if (!xmlData["w:document"] || !xmlData["w:document"]["w:body"]) return imageMap;

    const elements = xmlData["w:document"]["w:body"]["w:p"];
    elements.forEach((el, index) => {
        if (el["w:r"] && el["w:r"]["w:drawing"]) {
            // console.log(`🔍 Found Image in XML at Block ${index}`);

            const blip = el["w:r"]["w:drawing"]["wp:inline"]["a:graphic"]["a:graphicData"]["pic:pic"]["pic:blipFill"]["a:blip"];
            if (blip && blip["@_r:embed"]) {
                // console.log(`📸 Image Embed ID: ${blip["@_r:embed"]}`);
                imageMap.push({ id: blip["@_r:embed"], name: `test${testId}_q${imageCounter}.png` });
                imageCounter++;
            }
        }
    });


    for (const rel of Object.keys(relsData["Relationships"]["Relationship"])) {
        const relObj = relsData["Relationships"]["Relationship"][rel];
        if (relObj["@_Type"].includes("image")) {
            const target = relObj["@_Target"];
            const imageId = relObj["@_Id"];
            const matchingImage = imageMap.find((img) => img.id === imageId);
            if (matchingImage) {
                const imgPath = `word/${target.replace(/^\.\//, "")}`;
                const imageData = await zip.files[imgPath].async("nodebuffer");
                const imageFilePath = path.join(IMAGE_DIR, matchingImage.name);
                fs.writeFileSync(imageFilePath, imageData);
            }
        }
    }

    return imageMap.map((img) => img.name);
}

const sections = {};

async function extractQuestionsWithImages(filePath,testId) {
    const text = await extractTextWithImageMarkers(filePath);
    const images = await extractImagesFromDocx(filePath,testId);
    // console.log(images)
    let currentSection = null;
    let imageIndex = 0;

    const lines = text.split("\n");
    // console.log(lines)
    lines.forEach((line, i) => {
        if (line.startsWith("& ")) {
            currentSection = line.replace("& ", "").trim();
            if(!sections[currentSection]){
                sections[currentSection]=[];
            }
        } else if (currentSection && /^\d+-[A-Z]+\./.test(line)) {
            const typeMatch = line.match(/^(\d+)-([A-Z]+)\.\s*(.+)/);
            if (!typeMatch) return;
            const questionNumber = parseInt(typeMatch[1]);
            // console.log("This is here only",questionNumber);
            const questionType = typeMatch[2];
            let questionText = typeMatch[3].trim();
            let image = null;

            let imageLine = lines[i + 1].trim();
            let imageFlag = imageLine === 'Image= Yes' ? "" : null;


            const positiveMarksLine = lines[i + 2]?.trim();
            const negativeMarksLine = lines[i + 3]?.trim();

            const positiveMarks = parseFloat(positiveMarksLine?.match(/Positive marks=\s*(-?\d+(\.\d+)?)/)?.[1] || "0");
            const negativeMarks = parseFloat(negativeMarksLine?.match(/Negative marks=\s*(-?\d+(\.\d+)?)/)?.[1] || "0");
            // console.log("These are postive and negative marks",positiveMarks," ",negativeMarks);

            if (imageFlag === "" && imageIndex < images.length) {
                // console.log(`Assigning Image: ${images[imageIndex]} to Question ${i + 1}`);
                image = images[imageIndex];
                imageIndex++;
            } else {
                image = imageFlag;
            }
            i+=2;
            if (questionType === "MC" || questionType === "MMC") {
                const optionsMatch = [...lines.slice(i + 2, i + 6).map((opt) => opt.match(/([A-D])\)\s*(.+)/))];
                const answerMatch = lines.slice(i + 6, i + 7).join("").match(/Answer:\s*([A-D](?:,\s*[A-D])*)/);

                if (optionsMatch.length >= 2 && answerMatch) {
                    const answers = answerMatch[1].split(/\s*,\s*/);

                    sections[currentSection].push({
                        type: questionType === "MC" ? "single_correct" : "multi_correct",
                        question: questionText,
                        options: {
                            A: optionsMatch[0][2].trim(),
                            B: optionsMatch[1][2].trim(),
                            C: optionsMatch[2][2].trim(),
                            D: optionsMatch[3][2].trim(),
                        },
                        answer: questionType === "MC" ? answers[0] : answers,
                        image: image,
                        positiveMarks: positiveMarks,
                        negativeMarks: negativeMarks
                    });
                }
            } else if (questionType === "NU") {
                const answerMatch = lines.slice(i + 2, i + 3).join("").match(/Answer:\s*(.+)/);
                sections[currentSection].push({
                    type: "numerical",
                    question: questionText,
                    options: null,
                    answer: answerMatch ? answerMatch[1].trim() : "N/A",
                    image: image,
                    positiveMarks: positiveMarks,
                    negativeMarks: negativeMarks
                });
            }
        }
    });
    // console.log("This is sections",sections)
    return sections;
}

// function saveSectionsToFiles(sections) {
//     Object.keys(sections).forEach((subject) => {
//         if (sections[subject].length > 0) {
//             const filename = `${subject.toLowerCase()}.json`;
//             fs.writeFileSync(filename, JSON.stringify(sections[subject], null, 2), "utf-8");
//             console.log(`${subject} questions saved to ${filename}`);
//         }
//     });
// }

// const filePath = "sample_PCM.docx";
// extractQuestionsWithImages(filePath,"1");

module.exports = {extractQuestionsWithImages};