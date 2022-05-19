meta:
  id: pac
  application: TmrHiroADVSystem
  file-extension:
    - pac
  endian: le
seq:
  - id: chunk_count
    type: u2
  - id: name_length
    type: u1
  - id: data_offset
    type: u4
  - id: chunks
    type: chunk
    repeat: expr
    repeat-expr: chunk_count
instances:
  version:
    value: |
      data_offset == 7 + (name_length + 8) * chunk_count ? 1 : 
      data_offset == 7 + (name_length + 12) * chunk_count ? 2 :
      -1

types:
  file_data:
    seq:
      - id: rel_offset
        type:
          switch-on: _root.version
          cases:
            1: u4
            2: u8
      - id: offset_size
        type: u4
    instances:
      data:
        pos: rel_offset + _root.data_offset
        size: offset_size
        io: _root._io
      signature:
        type: u4
        pos: rel_offset + _root.data_offset
      signature_script:
        type: u4
        pos: rel_offset + _root.data_offset + 6
      cat:
        value: |
          signature == 0x5367674F ? "ogg" :
          6 == data[4].as<u2> and 0x140050 == signature_script ? "srp" :
          "unknown"
  chunk:
    seq:
      - id: name
        type: strz
        encoding: SJIS
        size: _root.name_length
      - id: file_content
        type: file_data
