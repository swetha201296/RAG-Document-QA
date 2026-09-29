from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
from pypdf import PdfReader
from docx import Document
from pptx import Presentation

import io
import re


# =====================================================
# APP
# =====================================================

app = FastAPI()


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# AI EMBEDDING MODEL
# =====================================================

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {
        "message": "InsightRAG Backend is running"
    }


# =====================================================
# PDF EXTRACTION
# =====================================================

def extract_pdf(file_bytes):

    reader = PdfReader(
        io.BytesIO(file_bytes)
    )

    pages = []

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        page_text = page.extract_text() or ""

        if page_text.strip():

            pages.append(
                f"[Page {page_number}]\n"
                f"{page_text}"
            )

    return "\n\n".join(pages)


# =====================================================
# DOCX EXTRACTION
# =====================================================

def extract_docx(file_bytes):

    document = Document(
        io.BytesIO(file_bytes)
    )

    text = []

    for paragraph in document.paragraphs:

        if paragraph.text.strip():

            text.append(
                paragraph.text.strip()
            )

    return "\n".join(text)


# =====================================================
# PPTX EXTRACTION
# =====================================================

def extract_pptx(file_bytes):

    presentation = Presentation(
        io.BytesIO(file_bytes)
    )

    slides_text = []

    for slide_number, slide in enumerate(
        presentation.slides,
        start=1
    ):

        slide_content = []

        for shape in slide.shapes:

            if hasattr(shape, "text"):

                value = shape.text.strip()

                if value:

                    slide_content.append(
                        value
                    )

        if slide_content:

            slides_text.append(
                f"[Slide {slide_number}]\n"
                + "\n".join(slide_content)
            )

    return "\n\n".join(
        slides_text
    )


# =====================================================
# TXT EXTRACTION
# =====================================================

def extract_txt(file_bytes):

    return file_bytes.decode(
        "utf-8",
        errors="ignore"
    )


# =====================================================
# UPLOAD DOCUMENT
# =====================================================

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    try:

        file_bytes = await file.read()

        filename = (
            file.filename or ""
        )

        extension = (
            filename
            .lower()
            .split(".")[-1]
        )


        # -----------------------------
        # EXTRACT TEXT
        # -----------------------------

        if extension == "pdf":

            text = extract_pdf(
                file_bytes
            )

        elif extension == "docx":

            text = extract_docx(
                file_bytes
            )

        elif extension == "pptx":

            text = extract_pptx(
                file_bytes
            )

        elif extension == "txt":

            text = extract_txt(
                file_bytes
            )

        else:

            return {
                "success": False,
                "message":
                    "Unsupported file format. "
                    "Please use PDF, DOCX, PPTX or TXT."
            }


        # -----------------------------
        # CHECK TEXT
        # -----------------------------

        if not text.strip():

            return {
                "success": False,
                "message":
                    "Could not extract readable "
                    "text from the document."
            }


        # -----------------------------
        # SUCCESS
        # -----------------------------

        return {
            "success": True,
            "filename": filename,
            "text": text,
            "characters": len(text)
        }


    except Exception as error:

        return {
            "success": False,
            "message": str(error)
        }


# =====================================================
# NORMALIZE TEXT
# =====================================================

def normalize_text(text):

    text = text.replace(
        "\x00",
        " "
    )

    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )

    return text.strip()


# =====================================================
# CLEAN PAGE / SLIDE LABEL
# =====================================================

def clean_page_slide_label(line):

    line = line.strip()

    line = re.sub(
        r"^\[(?:Page|Slide)\s+\d+\]\s*$",
        "",
        line,
        flags=re.IGNORECASE
    )

    return line.strip()


# =====================================================
# DETECT SECTION HEADING
# =====================================================

def detect_section_heading(line):

    clean = line.strip()

    # Remove page / slide label
    clean = re.sub(
        r"^\[(?:Page|Slide)\s+\d+\]\s*",
        "",
        clean,
        flags=re.IGNORECASE
    )

    # Remove numbering
    clean = re.sub(
        r"^\d+\s*[\.\-:]?\s*",
        "",
        clean
    )

    clean = clean.strip().lower()


    section_map = {

        "introduction":
            "Introduction",

        "problem statement":
            "Problem Statement",

        "problem":
            "Problem Statement",

        "objective":
            "Objectives",

        "objectives":
            "Objectives",

        "proposed system":
            "Proposed System",

        "proposed solution":
            "Proposed System",

        "system architecture":
            "System Architecture",

        "architecture":
            "System Architecture",

        "implementation process":
            "Implementation Process",

        "implementation":
            "Implementation Process",

        "technologies used":
            "Technologies Used",

        "technology":
            "Technologies Used",

        "technology stack":
            "Technologies Used",

        "features":
            "Features",

        "key features":
            "Features",

        "advantages":
            "Advantages",

        "applications":
            "Applications",

        "real world application":
            "Applications",

        "real-world application":
            "Applications",

        "limitations":
            "Limitations",

        "future scope":
            "Future Scope",

        "future":
            "Future Scope",

        "conclusion":
            "Conclusion",

        "summary":
            "Conclusion"
    }


    return section_map.get(
        clean
    )


# =====================================================
# STOP / NON-CONTENT LINES
# =====================================================

def is_noise_line(line):

    clean = line.strip().lower()

    if not clean:
        return True


    # Standalone page / slide number
    if re.fullmatch(
        r"\d+",
        clean
    ):
        return True


    # Page / slide labels
    if re.fullmatch(
        r"\[(?:page|slide)\s+\d+\]",
        clean,
        flags=re.IGNORECASE
    ):
        return True


    # Common presentation ending text
    noise = {
        "thank you",
        "thank you!",
        "questions?",
        "questions",
        "thank you questions?",
        "q&a",
        "q & a"
    }


    if clean in noise:
        return True


    return False


# =====================================================
# CLEAN ANSWER TEXT
# =====================================================

def clean_answer_text(text):

    if not text:
        return ""


    text = normalize_text(text)


    lines = []

    for line in text.split("\n"):

        line = line.strip()

        if is_noise_line(line):
            continue

        # Remove standalone numbering
        line = re.sub(
            r"^\d+\s*[\.\-:)]\s*",
            "",
            line
        )

        # Remove bullets
        line = re.sub(
            r"^[•●▪◦*\-]+\s*",
            "",
            line
        )

        if line:
            lines.append(line)


    # Remove duplicate lines
    unique_lines = []

    for line in lines:

        if line not in unique_lines:

            unique_lines.append(line)


    return "\n".join(
        unique_lines
    ).strip()


# =====================================================
# EXTRACT ALL SECTIONS
# =====================================================

def extract_sections(text):

    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]


    sections = {}

    current_section = None

    current_content = []


    for line in lines:

        heading = detect_section_heading(
            line
        )


        # -----------------------------------------
        # NEW SECTION
        # -----------------------------------------

        if heading:

            # Save previous section
            if current_section:

                cleaned_content = clean_answer_text(
                    "\n".join(
                        current_content
                    )
                )

                if cleaned_content:

                    sections[
                        current_section
                    ] = cleaned_content


            current_section = heading

            current_content = []

            continue


        # -----------------------------------------
        # IGNORE NOISE
        # -----------------------------------------

        if is_noise_line(line):
            continue


        # -----------------------------------------
        # ADD CONTENT
        # -----------------------------------------

        if current_section:

            current_content.append(
                line
            )


    # -----------------------------------------
    # SAVE FINAL SECTION
    # -----------------------------------------

    if current_section:

        cleaned_content = clean_answer_text(
            "\n".join(
                current_content
            )
        )

        if cleaned_content:

            sections[
                current_section
            ] = cleaned_content


    return sections


# =====================================================
# CREATE SEMANTIC CHUNKS
# =====================================================

def create_chunks(text):

    words = text.split()

    chunk_size = 80

    overlap = 20

    chunks = []

    start = 0


    while start < len(words):

        end = start + chunk_size

        chunk = " ".join(
            words[start:end]
        ).strip()


        if len(chunk) > 40:

            chunks.append(
                chunk
            )


        start += (
            chunk_size - overlap
        )


    return chunks


# =====================================================
# QUESTION → SECTION DETECTION
# =====================================================

def detect_requested_section(question):

    q = question.lower()


    section_questions = {

        "Problem Statement": [

            "problem statement",

            "what is the problem",

            "main problem",

            "problem addressed",

            "issue addressed",

            "what problem does this project solve"

        ],


        "Objectives": [

            "objective",

            "objectives",

            "goals",

            "aim of the project",

            "purpose of the project"

        ],


        "Introduction": [

            "introduction",

            "what is this project",

            "about this project",

            "overview of the project"

        ],


        "Proposed System": [

            "proposed system",

            "proposed solution",

            "solution proposed"

        ],


        "System Architecture": [

            "system architecture",

            "architecture of the system",

            "architecture"

        ],


        "Implementation Process": [

            "implementation process",

            "implementation",

            "how was it implemented"

        ],


        "Technologies Used": [

            "technologies used",

            "technology used",

            "technologies",

            "tech stack",

            "technology stack"

        ],


        "Features": [

            "features",

            "key features",

            "main features"

        ],


        "Advantages": [

            "advantages",

            "benefits",

            "main benefits"

        ],


        "Applications": [

            "applications",

            "real world applications",

            "real-world applications",

            "use cases"

        ],


        "Limitations": [

            "limitations",

            "limitations of the project",

            "drawbacks"

        ],


        "Future Scope": [

            "future scope",

            "future",

            "future improvements",

            "future enhancements"

        ],


        "Conclusion": [

            "conclusion",

            "summary",

            "final conclusion"

        ]

    }


    for section, keywords in (
        section_questions.items()
    ):

        for keyword in keywords:

            if keyword in q:

                return section


    return None


# =====================================================
# SEMANTIC SEARCH
# =====================================================

def semantic_search(
    question,
    document_text
):

    chunks = create_chunks(
        document_text
    )


    if not chunks:
        return None


    question_embedding = model.encode(
        question,
        convert_to_tensor=True
    )


    chunk_embeddings = model.encode(
        chunks,
        convert_to_tensor=True
    )


    similarities = util.cos_sim(
        question_embedding,
        chunk_embeddings
    )[0]


    ranked = []


    for index, score in enumerate(
        similarities
    ):

        ranked.append({

            "text":
                chunks[index],

            "score":
                float(score)

        })


    ranked.sort(
        key=lambda item:
            item["score"],
        reverse=True
    )


    best = ranked[0]


    if best["score"] < 0.20:

        return None


    return best


# =====================================================
# ASK QUESTION
# =====================================================

@app.post("/ask")
def ask_question(data: dict):

    question = data.get(
        "question",
        ""
    ).strip()


    document_text = data.get(
        "document_text",
        ""
    ).strip()


    # -------------------------------------------------
    # VALIDATION
    # -------------------------------------------------

    if not question:

        return {
            "answer":
                "Please enter a question."
        }


    if not document_text:

        return {
            "answer":
                "No document was uploaded."
        }


    # -------------------------------------------------
    # NORMALIZE
    # -------------------------------------------------

    document_text = normalize_text(
        document_text
    )


    # -------------------------------------------------
    # SECTION SEARCH
    # -------------------------------------------------

    requested_section = (
        detect_requested_section(
            question
        )
    )


    # -------------------------------------------------
    # EXACT SECTION ANSWER
    # -------------------------------------------------

    if requested_section:

        sections = extract_sections(
            document_text
        )


        section_answer = sections.get(
            requested_section,
            ""
        ).strip()


        if section_answer:

            return {

                "answer":
                    section_answer,

                "section":
                    requested_section,

                "source":
                    "Uploaded document"

            }


    # -------------------------------------------------
    # SEMANTIC FALLBACK
    # -------------------------------------------------

    result = semantic_search(
        question,
        document_text
    )


    if result is None:

        return {

            "answer":
                "I could not find a relevant answer "
                "in the uploaded document."

        }


    # -------------------------------------------------
    # CLEAN SEMANTIC RESULT
    # -------------------------------------------------

    cleaned_result = clean_answer_text(
        result["text"]
    )


    return {

        "answer":
            cleaned_result,

        "score":
            round(
                result["score"],
                3
            ),

        "source":
            "Uploaded document"

    }