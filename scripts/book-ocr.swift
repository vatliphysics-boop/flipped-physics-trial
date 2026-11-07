import Foundation
import Vision
import AppKit
struct Line: Codable { let text: String; let confidence: Float; let x: Double; let y: Double; let width: Double; let height: Double }
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
let supported = try req.supportedRecognitionLanguages()
if CommandLine.arguments.count < 2 { print(supported); exit(0) }
req.recognitionLanguages = supported.contains("vi-VT") ? ["vi-VT", "en-US"] : ["en-US"]
req.usesLanguageCorrection = true
for path in CommandLine.arguments.dropFirst() {
 do {
  let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path))
  try handler.perform([req])
  let lines = (req.results ?? []).compactMap { obs -> Line? in
   guard let c = obs.topCandidates(1).first else { return nil }
   let b=obs.boundingBox
   return Line(text:c.string,confidence:c.confidence,x:b.minX,y:1-b.maxY,width:b.width,height:b.height)
  }.sorted { $0.y < $1.y }
  let out = try JSONEncoder().encode(lines)
  try out.write(to:URL(fileURLWithPath:path + ".ocr.json"))
  print(path); fflush(stdout)
 } catch { fputs("ERROR \(path): \(error)\n", stderr) }
}
