import {FileAddFilled} from '@ant-design/icons'
import {Row, Divider, Layout, Menu} from 'antd'
import {omit} from 'lodash'
import {useEffect, useState} from 'react'
import Dropzone from 'react-dropzone'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '~/store'

import {getNextIndexedObjectKey} from '~/common/utils'

import FilePreview, {PreviewTypes} from '~/components/FilePreview'
import FileUploadButton from '~/components/FileUploadButton'

import {cmsActions} from '~/store/actions'
import {removeFile, updateFile} from '~/store/actions/cms'
import {filesSelector} from '~/store/selectors/cms'
import {FileInfo} from '~/store/types'

import FileCollection from './FileCollection'
import './fileexplorer.scss'

type FileExplorerProps = {}

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const dispatch = useDispatch<AppDispatch>()

  const forceUpdateTrigger = useSelector(
    (state: RootState) => state.cms.dataLayer.values.forceUpdateTrigger
  )
  const storedFiles = useSelector(filesSelector)

  const [files, setFiles] = useState(storedFiles)

  const onUpload = (acceptedFiles: File[]): void => {
    for (const acceptedFile of acceptedFiles) {
      const reader = new FileReader()
      reader.readAsDataURL(acceptedFile)

      reader.onload = () => {
        const dataUrl = reader.result?.toString()

        if (dataUrl) {
          // WA: Get latest files state in async context
          files[getNextIndexedObjectKey(files)] = {
            url: dataUrl,
            meta: {fileType: acceptedFile.type}
          }

          setFiles({...files})
        }
      }

      dispatch(
        cmsActions.addFile({
          file: acceptedFile,
          fileMeta: {fileType: acceptedFile.type}
        })
      )
    }
  }

  const onFileUpdate = (index: string, meta: FileInfo['meta']): void => {
    setFiles({
      ...files,
      [index]: {
        ...files[index],
        meta
      }
    })
    dispatch(updateFile({index, meta, combinedFiles: storedFiles}))
  }

  const onFileDelete = (index: string): void => {
    setFiles(omit(files, index))
    dispatch(removeFile(index))
  }

  const [showPreview, setShowPreview] = useState<{
    src: string
    type: PreviewTypes
  } | null>(null)

  const onFilePreview = (index: string): void => {
    if (view === 'IMAGES') {
      setShowPreview({
        src: files[index].url,
        type: 'IMAGE'
      })
    }

    if (view === 'DOCUMENTS') {
      setShowPreview({
        src: files[index].url,
        type: 'PDF'
      })
    }
  }

  const onClosePreview = (): void => {
    setShowPreview(null)
  }

  const [view, setView] = useState<'IMAGES' | 'VIDEOS' | 'DOCUMENTS'>('IMAGES')

  useEffect(() => {
    setFiles(storedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdateTrigger, view])

  const fileCollection = (): JSX.Element => {
    const collection = Object.entries(files)
      .map(([index, file]) => {
        return {index, ...file}
      })
      .filter(e => {
        const fileType = e.meta.fileType

        if (!fileType) {
          return false
        }

        if (view === 'IMAGES' && fileType.startsWith('image/')) {
          return true
        }

        if (view === 'DOCUMENTS' && fileType === 'application/pdf') {
          return true
        }

        return false
      })
      .reverse()

    return (
      <FileCollection
        onFileUpdate={onFileUpdate}
        onFileDelete={onFileDelete}
        onFilePreview={onFilePreview}
        files={collection}
      />
    )
  }

  return (
    <>
      {!!showPreview && (
        <FilePreview
          onClose={onClosePreview}
          visible={!!showPreview}
          src={showPreview.src}
          type={showPreview.type}
        />
      )}

      <Dropzone onDrop={onUpload}>
        {({getRootProps, getInputProps, isDragActive, isDragAccept}) => (
          <div {...getRootProps()} onClick={event => event.stopPropagation()}>
            <input {...getInputProps()} />
            {isDragActive && isDragAccept && (
              <div className="dropzone-overlay">
                <div className="text">
                  <FileAddFilled />
                </div>
              </div>
            )}

            <Layout>
              <Layout.Sider className="site-layout-background" width={200}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['1']}
                  defaultOpenKeys={['sub1']}
                  style={{height: '100%'}}>
                  <Row justify="center">
                    <FileUploadButton onUpload={onUpload} />
                  </Row>
                  <Divider plain orientation="left">
                    Media
                  </Divider>
                  <Menu.Item key="1" onClick={() => setView('IMAGES')}>
                    Images
                  </Menu.Item>
                  <Menu.Item key="2" onClick={() => setView('VIDEOS')}>
                    Videos
                  </Menu.Item>
                  <Divider plain orientation="left">
                    Other
                  </Divider>
                  <Menu.Item key="3" onClick={() => setView('DOCUMENTS')}>
                    Documents
                  </Menu.Item>
                </Menu>
              </Layout.Sider>
              <Layout.Content>{fileCollection()}</Layout.Content>
            </Layout>
          </div>
        )}
      </Dropzone>
    </>
  )
}

export default FileExplorer
