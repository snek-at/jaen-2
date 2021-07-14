import {SpecialZoomLevel, Viewer, Worker} from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import '@react-pdf-viewer/print/lib/styles/index.css'

import * as S from './style'

type PdfViewerProps = {src: string; toolbar?: boolean}

const PdfViewer: React.FC<PdfViewerProps> = ({src, toolbar = false}) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: {
      printPlugin: {
        enableShortcuts: false
      },
      zoomPlugin: {
        enableShortcuts: true
      }
    }
  })

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.js">
      <S.PdfViewer>
        <Viewer
          fileUrl={src}
          initialPage={0}
          theme="dark"
          defaultScale={SpecialZoomLevel.PageWidth}
          // set plugins if toolbar is enabled
          plugins={toolbar ? [defaultLayoutPluginInstance] : []}
        />
      </S.PdfViewer>
    </Worker>
  )
}

export default PdfViewer
