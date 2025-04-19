import service from '@/utils/request'

interface ArticlesListParams {
  page: number
  limit: number
}

interface Article {
  title: string
  content: string
  uri: string
}

export const ArticleAPI = {
  getList(params: ArticlesListParams) {
    return service({
      url: '/api/articles',
      method: 'GET',
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        order_by: 'created_at',
        sort: 'desc',
      },
    })
  },
  create(data: Article) {
    return service({
      url: '/api/articles',
      method: 'POST',
      data: {
        title: data.title,
        content: data.content,
        uri: data.uri,
      },
    })
  },
  update(data: Article) {
    return service({
      url: `/api/articles/uri/${data.uri}`,
      method: 'PUT',
      data: {
        title: data.title,
        content: data.content,
        uri: data.uri,
      },
    })
  },
  getByUri(uri: string) {
    return service({
      url: `/api/articles/uri/${uri}`,
      method: 'GET',
    })
  },
}
