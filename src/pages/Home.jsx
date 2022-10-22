import React, { useEffect, useState } from 'react'
import { firestore } from '../config/firebaseConfig'
import { doc, setDoc, collection, getDocs, onSnapshot, deleteDoc } from "firebase/firestore"
import moment from 'moment/moment'

export default function Home() {
    //state
    const [data, setData] = useState([])
    const [updateData, setUpdateData] = useState({})

    //handle submit
    const handleSubmit = (event) => {
        event.preventDefault()

        //tangkap value
        let note = event.target.note.value
        let author = event.target.author.value

        //clear
        event.target.note.value = ""
        event.target.author.value = ""
        console.info({ note, author })
        
        //store to firebase  //note_app : document firebase yang baru kita buat
        const docId = Date.now().toString()
        const notRef = doc(firestore, "note_app", docId)
        setDoc(notRef, {
            id: docId,
            note : note,
            author : author,
            createdAt : Date.now(),
        })
        .then(res => console.info("data berhasil disimpan"))
        .catch(err=>console.error(err))
    }

    //function untuk ambil data dari collection
    const getNotesCollection = async () => {
        let collArr = []
        let noteRef = collection(firestore, 'note_app')
        let collectData = await getDocs(noteRef).then((res) => {
            res.forEach((e) => {
                collArr.push(e.data())
            })
        })
        return collArr
    }

    //delete note
    const handleDelete = (id)=>{
        let docId = doc(firestore, "note_app", id)
        deleteDoc(docId)
            .then((res) => { console.info("data berhasil di delete") })
            .catch((err) => { console.error(err) })
    }

    //update date
    const handleUpdate = (event) => {

        event.preventDefault()
        let note = event.target.note.value
        const noteRef = doc(firestore, "note_app", updateData.id)
        setDoc(noteRef, {
            ...updateData,
            note : note
        })
        .then(res=>{console.info("data update")})
        .catch(err => { console.error(err) })
        setUpdateData(null)
    }

    //listner function
    const listener = () => {
        let noteRef = collection(firestore, "note_app")
        onSnapshot(noteRef, (newRec) => {
            console.info("Ada signal masuk bro")
            getNotesCollection()
            .then((res) => {
                console.info(res)
                setData(res)
            })
            .catch((err) => { console.error(err) })
        })
    }

    //comp life cycle
    useEffect(() => {
        getNotesCollection()
            .then((res) => {
                console.info(res)
                setData(res)
            })
            .catch((err) => { console.error(err) })
        
        //comp did update
        return () => {
            listener()
        }
    }, [])

  return (
      <div>
          <h1>Home Page</h1>
          <form action="" onSubmit={handleSubmit} autoComplete="off">
              <div>
                  <label htmlFor="note">note</label>
                  <textarea name="" id="note"></textarea>
              </div>
              <div>
                  <label htmlFor="author">author</label>
                  <textarea name="" id="author"></textarea>
              </div>
              <button type='submit'>submit</button>
          </form>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
              {data.map((e) => (
                  <div key={e.id} style={{
                      position :"relative",
                      padding :20,
                      border: "1px solid black",
                      borderRadius : 20
                  }}>
                      {updateData ?.id==e.id ? (
                          <form style={{
                              display: "flex",
                              flexDirecton: "column",
                              gap : 10
                          }}
                              onSubmit={handleUpdate}>
                              <label htmlFor="note">note</label>
                              <input type="text" id='note' defaultValue={e.note}/>
                              <button type='submit'>submit</button>
                          </form>
                      ) : (
                              <p>{ e.note }</p>
                      )}
                      



                    <small>{e.author} | </small>
                    <small>{moment(e.createdAt).format("DD/MM/YYYY hh:mm")}</small>
                      <button style={{
                          backgroundColor: "red",
                          borderRadius: 8,
                          position: "absolute",
                          top: 4,
                          right: 4,
                          fontSize : 10
                      }}
                          onClick={() => {
                          handleDelete(e.id)
                      }}
                      > x </button>
                      <button style={{
                          backgroundColor: "green",
                          borderRadius: 5,
                          position: "absolute",
                          top: 4,
                          right: 40,
                          fontSize : 10
                      }}
                          onClick={() => {
                              if (!updateData) {
                                  return setUpdateData(e)
                              }
                          setUpdateData(null)
                      }}
                      > ? </button>
                  </div>
              ))}
          </div>


    </div>
  )
}
