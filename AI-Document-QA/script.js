// =====================================================
// INSIGHTRAG - MAIN SCRIPT
// =====================================================


// =====================================================
// THEME
// =====================================================

function applySavedTheme() {

    const darkMode =
        localStorage.getItem("darkMode") !== "false";

    if (darkMode) {
        document.body.classList.remove("light-theme");
    } else {
        document.body.classList.add("light-theme");
    }
}

applySavedTheme();


// =====================================================
// SIGN UP
// =====================================================

function signup() {

    const nameElement =
        document.getElementById("name");

    const emailElement =
        document.getElementById("email");

    const passwordElement =
        document.getElementById("password");


    if (!nameElement || !emailElement || !passwordElement) {
        return;
    }


    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (
        name === "" ||
        email === "" ||
        password === ""
    ) {

        alert("Please fill all fields.");

        return;
    }


    localStorage.setItem(
        "userName",
        name
    );

    localStorage.setItem(
        "userEmail",
        email
    );

    localStorage.setItem(
        "userPassword",
        password
    );


    alert(
        "Account created successfully!"
    );


    window.location.href =
        "index.html";
}


// =====================================================
// LOGIN
// =====================================================

function login() {

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");


    if (!emailElement || !passwordElement) {
        return;
    }


    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    const savedEmail =
        localStorage.getItem("userEmail");

    const savedPassword =
        localStorage.getItem("userPassword");


    if (
        email === savedEmail &&
        password === savedPassword
    ) {

        localStorage.setItem(
            "loggedIn",
            "true"
        );

        alert(
            "Login successful!"
        );


        window.location.href =
            "dashboard.html";

    } else {

        alert(
            "Invalid Email or Password."
        );
    }
}


// =====================================================
// GET UPLOADED DOCUMENTS
// =====================================================

function getUploadedDocuments() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "uploadedDocuments"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Document list error:",
            error
        );

        return [];
    }
}


// =====================================================
// GET CURRENT DOCUMENT NAME
// =====================================================

function getCurrentDocumentName() {

    return (
        localStorage.getItem(
            "currentDocumentName"
        ) ||
        localStorage.getItem(
            "uploadedPDFName"
        ) ||
        localStorage.getItem(
            "uploadedDocumentName"
        ) ||
        ""
    );
}


// =====================================================
// GET CURRENT DOCUMENT TEXT
// =====================================================

function getCurrentDocumentText() {

    return (
        localStorage.getItem(
            "uploadedDocumentText"
        ) ||
        localStorage.getItem(
            "uploadedPDFText"
        ) ||
        ""
    );
}


// =====================================================
// UPDATE CURRENT DOCUMENT INFORMATION
// =====================================================

function updateCurrentDocumentUI() {

    const documentName =
        getCurrentDocumentName();


    const nameElements = [

        document.getElementById(
            "currentDocumentName"
        ),

        document.getElementById(
            "chatDocumentName"
        ),

        document.getElementById(
            "selectedDocumentName"
        ),

        document.getElementById(
            "activeDocumentName"
        )
    ];


    nameElements.forEach(function(element) {

        if (element) {

            element.innerText =
                documentName ||
                "No document selected";
        }
    });


    const questionElement =
        document.getElementById(
            "question"
        );


    if (
        questionElement &&
        !document.getElementById(
            "autoDocumentName"
        )
    ) {

        const documentInfo =
            document.createElement("div");


        documentInfo.id =
            "autoDocumentName";


        documentInfo.style.margin =
            "10px 0";


        documentInfo.style.padding =
            "10px 14px";


        documentInfo.style.borderRadius =
            "8px";


        documentInfo.style.fontSize =
            "13px";


        documentInfo.style.border =
            "1px solid rgba(108, 99, 255, 0.3)";


        documentInfo.style.background =
            "rgba(108, 99, 255, 0.08)";


        documentInfo.innerText =
            documentName
                ? "📄 Document: " + documentName
                : "📄 No document selected";


        questionElement.parentNode.insertBefore(
            documentInfo,
            questionElement
        );
    }


    const autoDocumentName =
        document.getElementById(
            "autoDocumentName"
        );


    if (autoDocumentName) {

        autoDocumentName.innerText =
            documentName
                ? "📄 Document: " + documentName
                : "📄 No document selected";
    }
}


// =====================================================
// DASHBOARD - RECENT DOCUMENTS
// =====================================================

function renderDashboardDocuments() {

    const container =
        document.getElementById(
            "dashboardRecentDocuments"
        );


    if (!container) {
        return;
    }


    const documents =
        getUploadedDocuments();


    if (documents.length === 0) {

        container.innerHTML = `
            <div class="recent-document-empty">

                <div class="document-icon">
                    DOC
                </div>

                <div class="document-info">

                    <strong>
                        No documents uploaded yet
                    </strong>

                    <small>
                        Upload a document to see it here
                    </small>

                </div>

                <div class="document-status">
                    —
                </div>

            </div>
        `;

        return;
    }


    const recentDocuments =
        [...documents]
            .reverse()
            .slice(0, 5);


    container.innerHTML =
        recentDocuments
            .map(function(document) {

                const name =
                    document.name ||
                    "Untitled document";


                const type =
                    document.type ||
                    "DOC";


                const uploadedAt =
                    document.uploadedAt
                        ? formatDocumentDate(
                            document.uploadedAt
                        )
                        : "Recently";


                return `
                    <div
                        class="recent-document-item"
                        style="
                            display:flex;
                            align-items:center;
                            gap:14px;
                            padding:14px 18px;
                            border-bottom:1px solid rgba(255,255,255,0.06);
                            cursor:pointer;
                        "
                        onclick="openDashboardDocument('${document.id}')"
                    >

                        <div
                            style="
                                width:34px;
                                height:34px;
                                border-radius:7px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:10px;
                                font-weight:700;
                                background:rgba(255,70,100,0.12);
                                color:#ff5272;
                                flex-shrink:0;
                            "
                        >
                            ${escapeHTML(type)}
                        </div>


                        <div
                            style="
                                flex:1;
                                min-width:0;
                            "
                        >

                            <div
                                style="
                                    font-weight:600;
                                    white-space:nowrap;
                                    overflow:hidden;
                                    text-overflow:ellipsis;
                                "
                            >
                                ${escapeHTML(name)}
                            </div>


                            <div
                                style="
                                    font-size:11px;
                                    opacity:0.65;
                                    margin-top:3px;
                                "
                            >
                                Uploaded
                                ${escapeHTML(uploadedAt)}
                            </div>

                        </div>


                        <div
                            style="
                                font-size:11px;
                                color:#00c896;
                                background:rgba(0,200,150,0.12);
                                padding:5px 10px;
                                border-radius:20px;
                            "
                        >
                            Ready
                        </div>

                    </div>
                `;
            })
            .join("");
}


// =====================================================
// FORMAT DOCUMENT DATE
// =====================================================

function formatDocumentDate(dateValue) {

    try {

        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {
            return "Recently";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return "Recently";
    }
}


// =====================================================
// DASHBOARD STATS
// =====================================================

function updateDashboardStats() {

    const documents =
        getUploadedDocuments();


    let analyticsData = [];


    try {

        analyticsData =
            JSON.parse(
                localStorage.getItem(
                    "analyticsData"
                ) || "[]"
            );

    } catch (error) {

        analyticsData = [];
    }


    const totalDocuments =
        documents.length;


    const totalQuestions =
        analyticsData.length;


    const successfulAnswers =
        analyticsData.filter(function(item) {

            return (
                item.successful === true ||
                item.success === true
            );

        }).length;


    let successRate = 0;


    if (totalQuestions > 0) {

        successRate =
            Math.round(
                (
                    successfulAnswers /
                    totalQuestions
                ) * 100
            );
    }


    let averageResponseTime = 0;


    if (totalQuestions > 0) {

        const totalTime =
            analyticsData.reduce(
                function(total, item) {

                    return total +
                        Number(
                            item.responseTime || 0
                        );

                },
                0
            );


        averageResponseTime =
            Math.round(
                totalTime /
                totalQuestions
            );
    }


    const documentCountElement =
        document.getElementById(
            "dashboardDocumentCount"
        );


    const questionCountElement =
        document.getElementById(
            "dashboardQuestionCount"
        );


    const successRateElement =
        document.getElementById(
            "dashboardSuccessRate"
        );


    const averageTimeElement =
        document.getElementById(
            "dashboardAverageTime"
        );


    if (documentCountElement) {

        documentCountElement.innerText =
            totalDocuments;
    }


    if (questionCountElement) {

        questionCountElement.innerText =
            totalQuestions;
    }


    if (successRateElement) {

        successRateElement.innerText =
            successRate + "%";
    }


    if (averageTimeElement) {

        averageTimeElement.innerText =
            averageResponseTime + "ms";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;
}


// =====================================================
// OPEN DASHBOARD DOCUMENT
// =====================================================

function openDashboardDocument(fileId) {

    if (!fileId) {
        return;
    }


    openDocument(fileId);
}


// =====================================================
// INDEXEDDB
// =====================================================

function openInsightRAGDatabase() {

    return new Promise(
        function(resolve, reject) {

            const request =
                indexedDB.open(
                    "InsightRAGFiles",
                    1
                );


            request.onupgradeneeded =
                function(event) {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            "files"
                        )
                    ) {

                        db.createObjectStore(
                            "files",
                            {
                                keyPath: "id"
                            }
                        );
                    }
                };


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );
                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );
                };
        }
    );
}


// =====================================================
// OPEN DOCUMENT FROM INDEXEDDB
// =====================================================

async function openDocument(fileId) {

    try {

        const db =
            await openInsightRAGDatabase();


        const fileData =
            await new Promise(
                function(resolve, reject) {

                    const transaction =
                        db.transaction(
                            "files",
                            "readonly"
                        );


                    const store =
                        transaction.objectStore(
                            "files"
                        );


                    const request =
                        store.get(fileId);


                    request.onsuccess =
                        function() {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        function() {

                            reject(
                                request.error
                            );
                        };
                }
            );


        if (
            !fileData ||
            !fileData.file
        ) {

            alert(
                "Document file not found."
            );

            return;
        }


        const blob =
            fileData.file;


        const url =
            URL.createObjectURL(blob);


        window.open(
            url,
            "_blank"
        );


    } catch (error) {

        console.error(
            "Open document error:",
            error
        );


        alert(
            "Unable to open document."
        );
    }
}


// =====================================================
// FORMAT ANSWER
// =====================================================

function formatAnswer(answer) {

    if (!answer) {

        return `
            <p>No answer found.</p>
        `;
    }


    // Convert Windows line breaks
    answer =
        String(answer)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");


    // Split into lines
    let lines =
        answer
            .split("\n")
            .map(function(line) {
                return line.trim();
            })
            .filter(function(line) {
                return line !== "";
            });


    // Remove duplicate lines
    lines =
        lines.filter(
            function(line, index) {

                return (
                    lines.indexOf(line) === index
                );
            }
        );


    // If backend returned one long paragraph,
    // split sentences into separate points.
    if (
        lines.length === 1 &&
        lines[0].length > 150
    ) {

        lines =
            lines[0]
                .split(
                    /(?<=[.!?])\s+(?=[A-Z])/g
                )
                .map(function(line) {
                    return line.trim();
                })
                .filter(function(line) {
                    return line !== "";
                });
    }


    // Create clean bullet-point answer
    return lines
        .map(function(line) {

            // Remove existing bullet characters
            line =
                line.replace(
                    /^[•●▪◦\-*]+\s*/,
                    ""
                );


            // Remove accidental numbering
            line =
                line.replace(
                    /^\d+[\.\)]\s*/,
                    ""
                );


            return `
                <div class="rag-answer-point">
                    <span class="rag-answer-bullet">•</span>
                    <span class="rag-answer-text">
                        ${escapeHTML(line)}
                    </span>
                </div>
            `;
        })
        .join("");
}


// =====================================================
// ASK QUESTION
// =====================================================

async function askQuestion() {

    const questionElement =
        document.getElementById(
            "question"
        );


    const answerBox =
        document.getElementById(
            "answer"
        );


    if (
        !questionElement ||
        !answerBox
    ) {

        return;
    }


    const question =
        questionElement.value.trim();


    if (question === "") {

        answerBox.innerHTML = `
            <p>Please enter a question.</p>
        `;

        return;
    }


    // ---------------------------------------------
    // GET CURRENT DOCUMENT
    // ---------------------------------------------

    const documentText =
        getCurrentDocumentText();


    if (!documentText) {

        answerBox.innerHTML = `
            <p>No document found.
            Please upload a document first.</p>
        `;

        return;
    }


    const currentDocumentName =
        getCurrentDocumentName();


    // ---------------------------------------------
    // SHOW LOADING
    // ---------------------------------------------

    answerBox.innerHTML = `
        <div class="rag-loading">
            <span>Searching document...</span>
        </div>
    `;


    const startTime =
        performance.now();


    try {

        // -----------------------------------------
        // SEND QUESTION TO BACKEND
        // -----------------------------------------

        const response =
            await fetch(
                "http://10.160.254.18:8000/ask",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            question,

                        document_text:
                            documentText
                    })
                }
            );


        const data =
            await response.json();


        const endTime =
            performance.now();


        const responseTime =
            Math.round(
                endTime - startTime
            );


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        if (response.ok) {

            const answer =
                data.answer ||
                "No answer found.";


            // =====================================
            // IMPORTANT:
            // DISPLAY CLEAN BULLET ANSWER
            // =====================================

            answerBox.innerHTML =
                formatAnswer(answer);


            // =====================================
            // SAVE HISTORY
            // =====================================

            saveQuestionHistory(
                question,
                answer,
                responseTime,
                currentDocumentName
            );


        } else {

            answerBox.innerHTML = `
                <p>
                    Backend error:
                    ${escapeHTML(
                        data.detail ||
                        data.message ||
                        "Unknown error"
                    )}
                </p>
            `;
        }


    } catch (error) {

        console.error(
            "Ask error:",
            error
        );


        answerBox.innerHTML = `
            <p>
                Cannot connect to backend.
                Make sure FastAPI is running.
            </p>
        `;
    }
}


// =====================================================
// SAVE QUESTION HISTORY
// =====================================================

function saveQuestionHistory(
    question,
    answer,
    responseTime,
    documentName
) {

    let analyticsData = [];


    try {

        analyticsData =
            JSON.parse(
                localStorage.getItem(
                    "analyticsData"
                ) || "[]"
            );

    } catch (error) {

        analyticsData = [];
    }


    analyticsData.push({

        question:
            question,

        answer:
            answer,

        documentName:
            documentName ||
            "Unknown document",

        responseTime:
            responseTime,

        successful:
            true,

        timestamp:
            new Date().toISOString()
    });


    localStorage.setItem(
        "analyticsData",
        JSON.stringify(
            analyticsData
        )
    );


    updateDashboardStats();
}


// =====================================================
// DOCUMENT UPLOAD
// =====================================================

const pdfFile =
    document.getElementById(
        "pdfFile"
    );


if (pdfFile) {

    pdfFile.addEventListener(
        "change",
        async function() {

            const files =
                Array.from(
                    this.files
                );


            if (files.length === 0) {
                return;
            }


            let db;


            try {

                db =
                    await openInsightRAGDatabase();

            } catch (error) {

                console.error(
                    "Database error:",
                    error
                );


                alert(
                    "Could not open document storage."
                );

                return;
            }


            let documents =
                getUploadedDocuments();


            let successfulUploads =
                0;


            for (
                const file of files
            ) {

                const extension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                // -----------------------------------------
                // SUPPORTED FORMATS
                // -----------------------------------------

                if (
                    ![
                        "pdf",
                        "txt",
                        "doc",
                        "docx",
                        "ppt",
                        "pptx"
                    ].includes(
                        extension
                    )
                ) {

                    alert(
                        "Unsupported file: " +
                        file.name
                    );

                    continue;
                }


                try {

                    // =====================================
                    // SEND FILE TO FASTAPI
                    // =====================================

                    const formData =
                        new FormData();


                    formData.append(
                        "file",
                        file
                    );


                    const response =
                        await fetch(
                            "http://10.160.254.18:8000/upload",
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            "Could not process " +
                            file.name +
                            "\n\n" +
                            (
                                data.message ||
                                data.detail ||
                                "Upload failed."
                            )
                        );

                        continue;
                    }


                    // =====================================
                    // SAVE EXTRACTED TEXT
                    // =====================================

                    localStorage.setItem(
                        "uploadedDocumentText",
                        data.text || ""
                    );


                    localStorage.setItem(
                        "uploadedPDFText",
                        data.text || ""
                    );


                    // =====================================
                    // CREATE UNIQUE FILE ID
                    // =====================================

                    const fileId =
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .substring(2, 10);


                    // =====================================
                    // SAVE CURRENT DOCUMENT
                    // =====================================

                    localStorage.setItem(
                        "currentDocumentName",
                        file.name
                    );


                    localStorage.setItem(
                        "currentDocumentId",
                        fileId
                    );


                    localStorage.setItem(
                        "uploadedDocumentName",
                        file.name
                    );


                    localStorage.setItem(
                        "uploadedPDFName",
                        file.name
                    );


                    // =====================================
                    // SAVE ACTUAL FILE TO INDEXEDDB
                    // =====================================

                    await new Promise(
                        function(
                            resolve,
                            reject
                        ) {

                            const transaction =
                                db.transaction(
                                    "files",
                                    "readwrite"
                                );


                            const store =
                                transaction.objectStore(
                                    "files"
                                );


                            store.put({

                                id:
                                    fileId,

                                name:
                                    file.name,

                                type:
                                    extension
                                        .toUpperCase(),

                                size:
                                    file.size,

                                uploadedAt:
                                    new Date()
                                        .toISOString(),

                                file:
                                    file
                            });


                            transaction.oncomplete =
                                function() {

                                    resolve();
                                };


                            transaction.onerror =
                                function() {

                                    reject(
                                        transaction.error
                                    );
                                };
                        }
                    );


                    // =====================================
                    // REMOVE OLD DUPLICATE ENTRY
                    // =====================================

                    documents =
                        documents.filter(
                            function(item) {

                                return (
                                    item.name !==
                                    file.name
                                );
                            }
                        );


                    // =====================================
                    // SAVE DOCUMENT METADATA
                    // =====================================

                    documents.push({

                        id:
                            fileId,

                        name:
                            file.name,

                        type:
                            extension
                                .toUpperCase(),

                        size:
                            file.size,

                        uploadedAt:
                            new Date()
                                .toISOString()
                    });


                    successfulUploads++;


                } catch (error) {

                    console.error(
                        "Upload error:",
                        error
                    );


                    alert(
                        "Error uploading " +
                        file.name +
                        "\n\n" +
                        error.message
                    );
                }
            }


            // =============================================
            // SAVE COMPLETE DOCUMENT LIST
            // =============================================

            localStorage.setItem(
                "uploadedDocuments",
                JSON.stringify(
                    documents
                )
            );


            // =============================================
            // UPDATE UI
            // =============================================

            renderDashboardDocuments();

            updateDashboardStats();

            updateCurrentDocumentUI();


            // =============================================
            // SUCCESS MESSAGE
            // =============================================

            if (
                successfulUploads > 0
            ) {

                alert(
                    successfulUploads +
                    " document(s) uploaded successfully!"
                );


                window.location.reload();
            }


            // Reset input

            this.value = "";

        }
    );
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        applySavedTheme();

        renderDashboardDocuments();

        updateDashboardStats();

        updateCurrentDocumentUI();

    }
);


// =====================================================
// PROFILE MENU
// =====================================================

const profileBox =
    document.querySelector(
        ".profile"
    );


const profileMenu =
    document.getElementById(
        "profileMenu"
    );


if (
    profileBox &&
    profileMenu
) {

    profileBox.addEventListener(
        "click",
        function(e) {

            if (
                e.target.closest(
                    ".profile-menu"
                )
            ) {

                return;
            }


            profileMenu.classList.toggle(
                "show"
            );
        }
    );


    document.addEventListener(
        "click",
        function(e) {

            if (
                !profileBox.contains(
                    e.target
                )
            ) {

                profileMenu.classList.remove(
                    "show"
                );
            }
        }
    );
}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
        "index.html";
}


// =====================================================
// PWA SERVICE WORKER
// =====================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker.register(
                "service-worker.js"
            )
            .then(
                function() {

                    console.log(
                        "InsightRAG PWA ready"
                    );
                }
            )
            .catch(
                function(error) {

                    console.log(
                        "PWA registration failed:",
                        error
                    );
                }
            );
        }
    );
}