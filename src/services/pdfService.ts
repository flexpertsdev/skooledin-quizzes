
import { Worksheet, StudentInfo } from "@/types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDF = async (
  worksheet: Worksheet, 
  studentInfo: StudentInfo
): Promise<string> => {
  // Create a temporary container for rendering
  const container = document.createElement("div");
  container.className = "pdf-container p-8 bg-white";
  container.style.width = "650px";
  container.style.fontFamily = "'Inter', sans-serif";
  
  // Add worksheet title
  const titleElement = document.createElement("h1");
  titleElement.textContent = worksheet.title;
  titleElement.style.fontSize = "24px";
  titleElement.style.fontWeight = "bold";
  titleElement.style.marginBottom = "16px";
  titleElement.style.color = "#9b87f5";
  titleElement.style.textAlign = "center";
  container.appendChild(titleElement);
  
  // Add student info
  const studentElement = document.createElement("div");
  studentElement.className = "student-info mb-4";
  studentElement.innerHTML = `
    <p><strong>Student:</strong> ${studentInfo.name}</p>
    <p><strong>Completed:</strong> ${studentInfo.timestamp}</p>
  `;
  container.appendChild(studentElement);
  
  // Calculate score
  const totalQuestions = worksheet.sections.reduce(
    (sum, section) => sum + section.questions.length, 
    0
  );
  
  const correctAnswers = worksheet.sections.reduce(
    (sum, section) => sum + section.questions.filter(q => q.isCorrect).length, 
    0
  );
  
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Add score
  const scoreElement = document.createElement("div");
  scoreElement.className = "score-info mb-8";
  scoreElement.innerHTML = `
    <div style="border: 2px solid #9b87f5; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 16px;">
      <p style="font-size: 18px; margin: 0;"><strong>Score:</strong> ${correctAnswers}/${totalQuestions} (${scorePercent}%)</p>
    </div>
  `;
  container.appendChild(scoreElement);
  
  // Loop through sections
  worksheet.sections.forEach(section => {
    // Add section title
    const sectionElement = document.createElement("div");
    sectionElement.className = "section mb-6";
    
    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = section.title;
    sectionTitle.style.fontSize = "18px";
    sectionTitle.style.fontWeight = "bold";
    sectionTitle.style.marginBottom = "8px";
    sectionTitle.style.color = "#1A1F2C";
    sectionElement.appendChild(sectionTitle);
    
    const instructions = document.createElement("p");
    instructions.textContent = section.instructions;
    instructions.style.marginBottom = "12px";
    sectionElement.appendChild(instructions);
    
    // Loop through questions
    section.questions.forEach((question, index) => {
      const questionElement = document.createElement("div");
      questionElement.className = "question mb-4 p-3";
      questionElement.style.border = "1px solid #e5e7eb";
      questionElement.style.borderRadius = "8px";
      questionElement.style.padding = "12px";
      questionElement.style.marginBottom = "16px";
      
      const questionText = document.createElement("p");
      questionText.textContent = `${index + 1}. ${question.text}`;
      questionText.style.marginBottom = "8px";
      questionText.style.fontWeight = "500";
      questionElement.appendChild(questionText);
      
      // Add user answer
      const userAnswerElement = document.createElement("div");
      userAnswerElement.innerHTML = `<p><strong>Your answer:</strong> ${question.userAnswer || "Not answered"}</p>`;
      
      // Style based on correctness
      if (question.isCorrect) {
        userAnswerElement.style.color = "#10b981";
      } else {
        userAnswerElement.style.color = "#ef4444";
        // Add correct answer for incorrect responses
        const correctAnswerElement = document.createElement("p");
        correctAnswerElement.innerHTML = `<strong>Correct answer:</strong> ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(", ") : question.correctAnswer}`;
        correctAnswerElement.style.color = "#10b981";
        userAnswerElement.appendChild(correctAnswerElement);
      }
      
      questionElement.appendChild(userAnswerElement);
      sectionElement.appendChild(questionElement);
    });
    
    container.appendChild(sectionElement);
  });
  
  // Temporarily add to document for rendering
  document.body.appendChild(container);
  
  // Generate PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  try {
    // Render HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      logging: false,
    });
    
    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // First page
    pdf.addImage(
      imgData, 
      "PNG", 
      0, 
      position, 
      imgWidth * ratio, 
      imgHeight * ratio
    );
    heightLeft -= pdfHeight;
    
    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData, 
        "PNG", 
        0, 
        position, 
        imgWidth * ratio, 
        imgHeight * ratio
      );
      heightLeft -= pdfHeight;
    }
    
    // Clean up
    document.body.removeChild(container);
    
    // Return as blob URL
    const pdfBlob = pdf.output("blob");
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error generating PDF:", error);
    document.body.removeChild(container);
    throw error;
  }
};
