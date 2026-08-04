import service from "@/utils/request"

interface QueryRequest {
  // max: string,
  // page: string,
  start: string,
  end: string
}

interface CreateRequest {
  content: string,
  date: string
}

interface UpdateRequest extends CreateRequest {
  ID: number,
  status: number
}
export const CalendarAPI = {
  getNote(data: QueryRequest) {
    return service({
      url: '/api/notes',
      method: "POST",
      data: data
    })
  },
  createNote(data: CreateRequest) {
    return service({
      url: "/api/notes/",
      method: "POST",
      data: data
    })
  },
  deleteNote() {

  },
  updateNote(data: UpdateRequest){
    console.log(data)
    return service({
      url: "/api/notes/update",
      method: "POST",
      data: data
    })
  }
}
