// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { useRouter } from "next/navigation"
// import { Mic, Square, ArrowRight, HelpCircle, Loader2 } from "lucide-react"
// import HomeButton from "@/components/home-button"

// import HelpDialog from "@/components/HelpDialog"
// const questions = [
//   "오늘 있었던 일 중에 가장 기억에 남는 일이 뭐야?",
//   "그 일은 언제, 어디에서 있었어?",
//   "그때 누구랑 같이 있었고, 어떤 일이 있었는지 이야기해 줄래?",
//   "그 일 때문에 기분이 어땠어?",
//   "그 일이 있고 나서 너는 어떤 생각이 들었어?",
// ]

// export default function QuestionsPage() {
//   const [helpDialogOpen, setHelpDialogOpen] = useState(false)
//   const [helpTab, setHelpTab] = useState<1 | 2>(1)
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [recordings, setRecordings] = useState<{ [index: number]: Blob }>({})
//   const [audioUrls, setAudioUrls] = useState<{ [index: number]: string | undefined }>({})
//   const [isRecording, setIsRecording] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [status, setStatus] = useState("")
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
//   const router = useRouter()

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const mediaRecorder = new MediaRecorder(stream)
//       mediaRecorderRef.current = mediaRecorder
//       audioChunksRef.current = []

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data)
//         }
//       }

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" })
//         const audioUrl = URL.createObjectURL(audioBlob)
//         setAudioUrls((prev) => ({ ...prev, [currentIndex]: audioUrl }))
//         setRecordings((prev) => ({ ...prev, [currentIndex]: audioBlob }))
//         stream.getTracks().forEach((track) => track.stop())
//       }

//       mediaRecorder.start()
//       setIsRecording(true)
//     } catch (error) {
//       console.error("마이크 오류:", error)
//       alert("마이크 권한을 확인해주세요.")
//     }
//   }

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop()
//     setIsRecording(false)
//   }

//   const uploadAllRecordings = async () => {
//     try {
//       setIsUploading(true)
//       const uploadedUrls: { [key: number]: string } = {}

//       for (const [index, blob] of Object.entries(recordings)) {
//         const formData = new FormData()
//         formData.append("file", blob, `question_${index}.mp3`)

//         const res = await fetch("/api/proxy-upload", {
//           method: "POST",
//           body: formData,
//         })

//         if (!res.ok) {
//           const errorText = await res.text()
//           throw new Error(`(${index}) 업로드 실패: ${res.status} - ${errorText}`)
//         }

//         const data = await res.json()
//         uploadedUrls[+index] = data.file_url
//       }

//       console.log("✅ 모든 녹음 업로드 완료:", uploadedUrls)
//       setStatus("✅ 전체 업로드 성공!")
//       router.push(`/loading?storyId=uploaded`)
//     } catch (error) {
//       console.error("❌ 업로드 오류:", error)
//       alert(error instanceof Error ? error.message : "업로드 중 오류 발생")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
//       <HomeButton />
//       <Button variant="outline" size="icon" className="absolute top-4 left-16 z-10" onClick={() => setHelpDialogOpen(true)}>
//         <HelpCircle className="h-5 w-5" />
//       </Button>
//       <HelpDialog
//         open={helpDialogOpen}
//         onOpenChange={setHelpDialogOpen}
//         helpTab={helpTab}
//         setHelpTab={setHelpTab}
//       />

//       <div className="w-full max-w-3xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">질문 {currentIndex + 1} / {questions.length}</h1>
//         <Card className="p-4 bg-white/90 backdrop-blur-sm">
//           <h2 className="text-xl font-semibold mb-6 text-center">{questions[currentIndex]}</h2>
//           <div className="flex flex-col items-center gap-4">
//             {!isRecording && !audioUrls[currentIndex] && (
//               <Button onClick={startRecording} className="flex items-center gap-2">
//                 <Mic className="h-5 w-5" />녹음 시작
//               </Button>
//             )}
//             {isRecording && (
//               <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
//                 <Square className="h-5 w-5" />녹음 중지
//               </Button>
//             )}
//             {audioUrls[currentIndex] && !isRecording && (
//               <div className="flex flex-col items-center gap-2 w-full">
//                 <audio controls className="w-full mt-2" src={audioUrls[currentIndex]} />
//                 <Button
//                   onClick={() => {
//                     setAudioUrls((prev) => ({ ...prev, [currentIndex]: undefined }))
//                     setRecordings((prev) => {
//                       const copy = { ...prev }
//                       delete copy[currentIndex]
//                       return copy
//                     })
//                   }}
//                   variant="outline"
//                 >
//                   다시 녹음
//                 </Button>
//               </div>
//             )}
//           </div>
//         </Card>

//         {/* 이전/다음 버튼 */}
//         <div className="flex justify-between mt-6">
//           <Button onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0} variant="secondary">
//             이전
//           </Button>
//           {currentIndex < questions.length - 1 && (
//             <Button onClick={() => setCurrentIndex((i) => i + 1)} disabled={!recordings[currentIndex]}>
//               다음 <ArrowRight className="h-4 w-4 ml-1" />
//             </Button>
//           )}
//         </div>

//         {/* "동화 만들기!" 버튼 */}
//         {currentIndex === questions.length - 1 &&
//           Object.keys(recordings).length === questions.length && (
//             <div className="flex justify-center mt-10">
//               <Button
//                 onClick={uploadAllRecordings}
//                 disabled={isUploading}
//                 className="text-lg px-6 py-3"
//               >
//                 {isUploading ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" /> 업로드 중...</>) : "동화 만들기!"}
//               </Button>
//             </div>
//           )}

//         {status && <p className="mt-4 text-green-600 font-semibold text-center">{status}</p>}
//       </div>
//     </main>
//   )
// }
// // pages/index.js
// "use client";
// import { useState, useRef, useEffect } from 'react';

// import Head from 'next/head';

// export default function Home() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURL, setAudioURL] = useState<string | null>(null);
//   const [currentQuestion, setCurrentQuestion] = useState(1);
//   const [recordingStatus, setRecordingStatus] = useState('');
//   const [uploadStatus, setUploadStatus] = useState('');
  
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
  
//   const questions = [
//     "1. A",
//     "2. B",
//     "3. C",
//     "4. D",
//     "5. E",
//     "6. F",
//     "7. G",
//     "8. H",
//     "9. I",
//     "10. J"
//   ];

//   const startRecording = async () => {
//     audioChunksRef.current = [];
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
      
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setAudioURL(audioUrl);
//       };

//       setIsRecording(true);
//       setRecordingStatus('녹음 중...');
//       mediaRecorderRef.current.start();
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setRecordingStatus('녹음 완료');
      
//       // Stop all tracks on the active stream
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     }
//   };

//   const uploadRecording = async () => {
//     if (!audioChunksRef.current.length) {
//       setUploadStatus('업로드할 녹음이 없습니다.');
//       return;
//     }

//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
//     const formData = new FormData();
//     formData.append('audio', audioBlob, `audiosample${currentQuestion}.mp3`);

//     setUploadStatus('업로드 중...');
    
//     try {
//       // 실제 API 엔드포인트로 변경해야 합니다
//       const response = await fetch('http://174.129.219.18:8000/upload/mp3', {
//         method: 'POST',
//         body: formData
//       });

//       if (response.ok) {
//         setUploadStatus(`audiosample${currentQuestion}.mp3 파일 업로드 성공!`);
//       } else {
//         setUploadStatus(`업로드 실패: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//     }
//   };

//   const nextQuestion = () => {
//     if (currentQuestion < 10) {
//       setCurrentQuestion(currentQuestion + 1);
//       setAudioURL(null);
//       setRecordingStatus('');
//       setUploadStatus('');
//     }
//   };

//   const prevQuestion = () => {
//     if (currentQuestion > 1) {
//       setCurrentQuestion(currentQuestion - 1);
//       setAudioURL(null);
//       setRecordingStatus('');
//       setUploadStatus('');
//     }
//   };

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
//         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100 py-10">
//       <Head>
//         <title>음성 녹음 앱</title>
//         <meta name="description" content="음성 녹음 및 업로드 앱" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
//         <h1 className="text-2xl font-bold mb-6 text-center">음성 녹음 앱</h1>
        
//         <div className="mb-6">
//           <div className="text-xl font-medium mb-3">
//             질문 {currentQuestion}/10: {questions[currentQuestion - 1]}
//           </div>
          
//           <div className="flex justify-between mb-4">
//             <button 
//               onClick={prevQuestion}
//               disabled={currentQuestion === 1}
//               className={`px-4 py-2 rounded ${currentQuestion === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
//             >
//               이전 질문
//             </button>
            
//             <button 
//               onClick={nextQuestion}
//               disabled={currentQuestion === 10}
//               className={`px-4 py-2 rounded ${currentQuestion === 10 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
//             >
//               다음 질문
//             </button>
//           </div>
//         </div>
        
//         <div className="flex flex-col space-y-4">
//           <div className="flex justify-center space-x-4">
//             <button
//               onClick={startRecording}
//               disabled={isRecording}
//               className={`px-4 py-2 rounded ${isRecording ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'}`}
//             >
//               녹음 시작
//             </button>
            
//             <button
//               onClick={stopRecording}
//               disabled={!isRecording}
//               className={`px-4 py-2 rounded ${!isRecording ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'}`}
//             >
//               녹음 정지
//             </button>
//           </div>
          
//           {recordingStatus && (
//             <div className="text-center font-medium">
//               {recordingStatus}
//             </div>
//           )}
          
//           {audioURL && (
//             <div className="flex flex-col items-center space-y-4">
//               <p className="font-medium">녹음된 오디오:</p>
//               <audio src={audioURL} controls className="w-full" />
              
//               <button
//                 onClick={uploadRecording}
//                 className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//               >
//                 업로드
//               </button>
//             </div>
//           )}
          
//           {uploadStatus && (
//             <div className="mt-4 p-3 bg-gray-100 rounded text-center">
//               {uploadStatus}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
// pages/index.js
"use client";
import { useState, useRef, useEffect } from 'react';

import Head from 'next/head';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const questions = [
    "1. A",
    "2. B",
    "3. C",
    "4. D",
    "5. E",
    "6. F",
    "7. G",
    "8. H",
    "9. I",
    "10. J"
  ];

  const startRecording = async () => {
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // MediaRecorder 생성 시 MIME 타입과 비트레이트 지정
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // 대부분의 브라우저가 지원하는 포맷
        audioBitsPerSecond: 128000 // 높은 품질의 오디오 (128kbps)
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Blob 생성 시 MIME 타입 지정
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      // 데이터 수집 간격 설정 (1초마다)
      setIsRecording(true);
      setRecordingStatus('녹음 중...');
      mediaRecorderRef.current.start(1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStatus('녹음 완료');
      
      // Stop all tracks on the active stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadRecording = async () => {
    if (!audioChunksRef.current.length) {
      setUploadStatus('업로드할 녹음이 없습니다.');
      return;
    }

    // MIME 타입을 audio/mpeg으로 변경 (mp3 파일을 위해)
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
    const fileName = `audiosample${currentQuestion}.mp3`;
    
    // FormData 객체 생성 및 파일 추가
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    
    setUploadStatus('업로드 중...');
    
    try {
      // 실제 API 엔드포인트로 요청
      const response = await fetch("/api/proxy-upload", {
        method: 'POST',
        body: formData,
        // CORS 이슈 방지 및 자격증명 포함
        credentials: 'include',
        headers: {
          // FormData는 자동으로 Content-Type을 multipart/form-data로 설정하므로 따로 지정하지 않음
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setUploadStatus(`${fileName} 파일 업로드 성공!`);
      } else {
        // 응답 내용을 가져와서 더 자세한 오류 정보 제공
        try {
          const errorData = await response.json();
          setUploadStatus(`업로드 실패: ${response.status} - ${JSON.stringify(errorData)}`);
        } catch (e) {
          setUploadStatus(`업로드 실패: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < 10) {
      setCurrentQuestion(currentQuestion + 1);
      setAudioURL(null);
      setRecordingStatus('');
      setUploadStatus('');
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setAudioURL(null);
      setRecordingStatus('');
      setUploadStatus('');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <Head>
        <title>음성 녹음 앱</title>
        <meta name="description" content="음성 녹음 및 업로드 앱" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">음성 녹음 앱</h1>
        
        <div className="mb-6">
          <div className="text-xl font-medium mb-3">
            질문 {currentQuestion}/10: {questions[currentQuestion - 1]}
          </div>
          
          <div className="flex justify-between mb-4">
            <button 
              onClick={prevQuestion}
              disabled={currentQuestion === 1}
              className={`px-4 py-2 rounded ${currentQuestion === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              이전 질문
            </button>
            
            <button 
              onClick={nextQuestion}
              disabled={currentQuestion === 10}
              className={`px-4 py-2 rounded ${currentQuestion === 10 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              다음 질문
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`px-4 py-2 rounded ${isRecording ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              녹음 시작
            </button>
            
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`px-4 py-2 rounded ${!isRecording ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              녹음 정지
            </button>
          </div>
          
          {recordingStatus && (
            <div className="text-center font-medium">
              {recordingStatus}
            </div>
          )}
          
          {audioURL && (
            <div className="flex flex-col items-center space-y-4">
              <p className="font-medium">녹음된 오디오:</p>
              <audio src={audioURL} controls className="w-full" />
              
              <button
                onClick={uploadRecording}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                업로드
              </button>
            </div>
          )}
          
          {uploadStatus && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-center">
              {uploadStatus}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}