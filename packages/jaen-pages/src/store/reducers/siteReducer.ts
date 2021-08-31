import {createReducer, PayloadAction} from '@reduxjs/toolkit'
import update from 'immutability-helper'
import {v4 as uuidv4} from 'uuid'

import {renameObjectKey} from '../../tools'
import {toPath, toSlug} from '../../tools/site/path'
import {BlocksField, PageMetadata, PlainField} from '../../types'
import * as actions from '../actions/siteActions'
import {SiteState} from '../types'

const initialState: SiteState = {
  routing: {
    dynamicPaths: {}
  }
}

const siteReducer = createReducer(initialState, {
  [actions.updateSiteMeta.type]: (
    state,
    action: PayloadAction<actions.UpdateSiteMetaActionPayload>
  ) => {
    const {meta} = action.payload

    state.siteMetadata = meta
  },
  [actions.addPage.type]: (
    state,
    action: PayloadAction<actions.AddPageActionPayload>
  ) => {
    const {pageId, page} = action.payload
    const parentId = page.parent?.id

    state.allSitePage = {
      ...state.allSitePage,
      nodes: {
        ...state.allSitePage?.nodes,
        [pageId]: page
      }
    }

    if (parentId) {
      const parentChildren = state.allSitePage?.nodes?.[parentId]?.children

      if (!parentChildren) {
        state.allSitePage = {
          ...state.allSitePage,
          nodes: {
            ...state.allSitePage?.nodes,
            [parentId]: {
              ...state.allSitePage?.nodes?.[parentId],
              children: [{id: pageId}]
            }
          }
        }
      } else {
        if (!parentChildren.includes({id: pageId})) {
          parentChildren.push({id: pageId})
        }
      }
    }
  },
  [actions.deletePage.type]: (state, action: PayloadAction<string>) => {
    const pageId = action.payload

    state.allSitePage = {
      ...state.allSitePage,
      nodes: {
        ...state.allSitePage?.nodes,
        [pageId]: {
          ...state.allSitePage?.nodes?.[pageId],
          deleted: true
        }
      }
    }
  },
  [actions.movePage.type]: (
    state,
    action: PayloadAction<actions.MovePageActionPayload>
  ) => {
    const {pageId, parentPageId} = action.payload

    const oldParent = state.allSitePage?.nodes?.[pageId]?.parent?.id as
      | string
      | null

    if (oldParent === parentPageId) {
      return
    }

    state.allSitePage = {
      ...state.allSitePage,
      nodes: {
        ...state.allSitePage?.nodes,
        [pageId]: {
          ...state.allSitePage?.nodes?.[pageId],
          parent: parentPageId
            ? {
                ...state.allSitePage?.nodes?.[pageId]?.parent,
                id: parentPageId
              }
            : null
        }
      }
    }

    if (parentPageId) {
      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [parentPageId]: {
            ...state.allSitePage?.nodes?.[parentPageId],
            children: (
              state.allSitePage?.nodes?.[parentPageId]?.children || []
            ).concat([{id: pageId}])
          }
        }
      }
      // const parentChildren = state.allSitePage?.nodes?.[parentPageId]?.children
      // if (parentChildren) {
      //   const index = parentChildren.findIndex(child => child?.id === pageId)
      //   if (index > -1) {
      //     parentChildren.splice(index, 1)
      //   }
      // }
    }

    //remove pageId node from oldParent node children newAllSitePage
    if (oldParent) {
      const children = state.allSitePage?.nodes?.[oldParent]?.children

      if (children) {
        state.allSitePage = {
          ...state.allSitePage,
          nodes: {
            ...state.allSitePage?.nodes,
            [oldParent]: {
              ...state.allSitePage?.nodes?.[oldParent],
              children: children.filter(child => child?.id !== pageId)
            }
          }
        }
      }
    }
  },
  [actions.updatePage.type]: (
    state,
    action: PayloadAction<actions.UpdatePageActionPayload>
  ) => {
    const {pageId, slug, meta} = action.payload

    state.allSitePage = {
      ...state.allSitePage,
      nodes: {
        ...state.allSitePage?.nodes,
        [pageId]: {
          ...state.allSitePage?.nodes?.[pageId]
        }
      }
    }

    if (slug) {
      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [pageId]: {
            ...state.allSitePage?.nodes?.[pageId],
            slug
          }
        }
      }
    }

    if (meta) {
      // const pageMetadata =
      //   state.allSitePage?.nodes?.[pageId]?.pageMetadata || ({} as any)
      // Object.entries(meta).forEach(([key, value]) => {
      //   // state.allSitePage = {
      //   //   ...state.allSitePage,
      //   //   nodes: {
      //   //     ...state.allSitePage?.nodes,
      //   //     [pageId]: {
      //   //       ...state.allSitePage?.nodes?.[pageId],
      //   //       pageMetadata: {
      //   //         ...state.allSitePage?.nodes?.[pageId]?.pageMetadata,
      //   //         [key]: value
      //   //       } as PageMetadata
      //   //     }
      //   //   }
      //   // }

      //   pageMetadata[key] = value
      //   console.log('META UPDATE', key, value)
      // })

      // console.log('META UPDATE FULL', pageMetadata)

      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [pageId]: {
            ...state.allSitePage?.nodes?.[pageId],
            pageMetadata: meta as PageMetadata
          }
        }
      }
    }

    // let page = state.allSitePage?.nodes?.[pageId]

    // if (page) {
    //   if (slug) {
    //     page.slug = slug
    //   }

    //   if (meta) {
    //     Object.entries(meta).forEach(([key, value]: any) => {
    //       page = {
    //         ...page,
    //         pageMetadata: {
    //           ...page!.pageMetadata,
    //           [key]: value
    //         }
    //       }
    //     })
    //   }
    // }

    // const newAllSitePage = update(state.allSitePage, {
    //   nodes: {
    //     [pageId]: {
    //       pageMetadata: {
    //         $set: meta
    //       }
    //     }
    //   }
    // })

    // state.allSitePage
  },
  [actions.registerPageField.type]: (
    state,
    action: PayloadAction<actions.RegisterPageFieldActionPayload>
  ) => {
    const {pageId, field} = action.payload

    const f = state.allSitePage?.nodes?.[pageId]?.fields?.[field.fieldName]

    if (field.block) {
      const blockField = f as BlocksField

      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [pageId]: {
            ...state.allSitePage?.nodes?.[pageId],
            fields: {
              ...state.allSitePage?.nodes?.[pageId]?.fields,
              [field.fieldName]: {
                ...blockField,
                _type: 'BlocksField',
                blocks: {
                  ...blockField?.blocks,
                  [field.block.position]: {
                    ...blockField?.blocks?.[field.block.position],
                    typeName: field.block.typeName,
                    fields: field.block.blockFieldName
                      ? {
                          ...blockField?.blocks?.[field.block.position]?.fields,
                          [field.block.blockFieldName]: {}
                        }
                      : {}
                  }
                }
              }
            }
          }
        }
      }
    } else {
      const plainField = f as PlainField

      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [pageId]: {
            ...state.allSitePage?.nodes?.[pageId],
            fields: {
              ...state.allSitePage?.nodes?.[pageId]?.fields,
              [field.fieldName]: {
                ...plainField,
                _type: 'PlainField'
              }
            }
          }
        }
      }
    }
  },
  [actions.unregisterPageField.type]: (
    state,
    action: PayloadAction<actions.UnregisterPageFieldActionPayload>
  ) => {
    const {pageId, field} = action.payload

    const nodeFields = state.allSitePage?.nodes?.[pageId]?.fields

    if (field.block) {
      if (field.block.blockFieldName) {
        delete (nodeFields?.[field.fieldName] as BlocksField).blocks?.[
          field.block.position
        ]?.fields?.[field.block.blockFieldName]
      } else {
        delete (nodeFields?.[field.fieldName] as BlocksField).blocks?.[
          field.block.position
        ]
      }
    } else {
      delete nodeFields?.[field.fieldName]
    }
  },
  [actions.deletePageField.type]: (
    state,
    action: PayloadAction<actions.DeletePageFieldActionPayload>
  ) => {
    const {pageId, field} = action.payload

    const f = state.allSitePage?.nodes?.[pageId]?.fields?.[field.fieldName]

    if (field.block) {
      const blockField = f as BlocksField

      state.allSitePage = {
        ...state.allSitePage,
        nodes: {
          ...state.allSitePage?.nodes,
          [pageId]: {
            ...state.allSitePage?.nodes?.[pageId],
            fields: {
              ...state.allSitePage?.nodes?.[pageId]?.fields,
              [field.fieldName]: {
                ...blockField,
                _type: 'BlocksField',
                blocks: {
                  ...blockField?.blocks,
                  [field.block.position]: {
                    ...blockField?.blocks?.[field.block.position],
                    deleted: true
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  [actions.updatePageField.type]: (
    state,
    action: PayloadAction<actions.UpdatePageFieldActionPayload>
  ) => {
    const {pageId, fieldDetails} = action.payload

    if (fieldDetails._type === 'BlocksField') {
      ;(state.allSitePage?.nodes?.[pageId]?.fields?.[
        fieldDetails.fieldName
      ] as BlocksField).blocks[fieldDetails.blockPosition].fields[
        fieldDetails.blockFieldName
      ] = fieldDetails.block
    } else if (fieldDetails._type === 'PlainField') {
      ;(state.allSitePage?.nodes?.[pageId]?.fields?.[
        fieldDetails.fieldName
      ] as PlainField).content = fieldDetails.block
    }
  },
  [actions.discardSiteChanges.type]: (state, action: PayloadAction<void>) =>
    initialState,
  [actions.updateSiteRouting.type]: (
    state,
    action: PayloadAction<actions.UpdateSiteRoutingActionPayload>
  ) => {
    const {dynamicPaths} = action.payload

    //> Dynamic paths

    // Remove all existing paths that id is included in dynamicPaths.affectedIds
    const ids = dynamicPaths.affectedIds

    for (const [path, id] of Object.entries(state.routing.dynamicPaths)) {
      if (ids.includes(id)) {
        delete state.routing.dynamicPaths[path]
      }
    }

    // Add new dynamic paths
    state.routing.dynamicPaths = {
      ...state.routing.dynamicPaths,
      ...dynamicPaths.dynamicPaths
    }
  }
})

export default siteReducer