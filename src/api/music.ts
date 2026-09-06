import service from "@/utils/request"

export const MusicAPI = {
  getMusic(url:string) {
    return service({
      url: url,
      method: "GET",
      responseType: 'arraybuffer'
    },)
  },
  getLrc(url: string) {
    return service({
      url: url,
      method: "GET"
    })
  }
}
