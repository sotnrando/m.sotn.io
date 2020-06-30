const elems = {
  slot1: document.getElementById('slot1'),
  slot2: document.getElementById('slot2'),
  button: document.getElementById('convert-button'),
  download: document.getElementById('download'),
}

function dragOverListener(event) {
  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'copy'
  event.target.classList.add('active')
}

function dragLeaveListener(event) {
  event.target.classList.remove('active')
}

const selectedFiles = [{}, {}]
const map = new Map()
map.set(elems.slot1, selectedFiles[0])
map.set(elems.slot2, selectedFiles[1])

function dropListener(event) {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer.items) {
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      const item = event.dataTransfer.items[i]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        map.get(event.target).file = file
      }
    }
  } else {
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i]
      map.get(event.target).file = file
    }
  }
  elems.button.disabled = false
}

[elems.slot1, elems.slot2].forEach(function(slot) {
  slot.addEventListener('dragover', dragOverListener)
  slot.addEventListener('dragleave', dragLeaveListener)
  slot.addEventListener('drop', dropListener)
})

function concatFiles(name, files) {
  const saveram = new Uint8Array(2 * 131072)
  saveram.set(files[0])
  saveram.set(files[1], 131072)
  elems.download.download = name
  const url = URL.createObjectURL(new Blob([saveram], {
    type: 'application/octet-binary',
  }))
  elems.download.href = url
  elems.download.click()
  URL.revokeObjectURL(url)
}

elems.button.addEventListener('click', function(event) {
  let filesRead = 0
  const files = new Array(2)
  const name = selectedFiles.reduce(function(name, o) {
    if (o.file && !name) {
      return o.file.name
    }
    return name
  }, '').replace(/\..*$/, '.SaveRAM')
  selectedFiles.forEach(function(o, index) {
    if (o.file) {
      const reader = new FileReader()
      reader.addEventListener('load', function() {
        files[index] = new Uint8Array(this.result)
        if (++filesRead == files.length) {
          concatFiles(name, files)
        }
      })
      reader.readAsArrayBuffer(o.file)
    } else {
      const file = new Uint8Array(131072)
      files[index] = file
      if (++filesRead == files.length) {
        concatFiles(name, files)
      }
    }
  })
})
