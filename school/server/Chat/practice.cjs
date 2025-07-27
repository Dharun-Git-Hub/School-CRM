const a = {
  people: [
    { staff: 'd65592e2-38b9-455d-8c93-be13428eceb9' },
    { students: [] }
  ]
}

for(let i of a.people.values()){
    console.log(i)
}