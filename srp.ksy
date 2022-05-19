meta:
  id: srp
  application: TmrHiroADVSystem
  file-extension:
    - srp
  endian: le
  title: srp
seq:
  - id: chunk_count
    type: u4
  - id: chunks
    type: chunk
    repeat: expr
    repeat-expr: chunk_count

types:
  chunk:
    seq:
      - id: code_size
        type: u2
      - id: code_data
        size: code_size
        type: code_meta
  code_select:
    seq:
      - id: count
        type: u1
      - id: buff
        type: u1
  code_meta:
    seq:
      - id: code_type
        type: u4
      - id: raw_text
        type: str
        encoding: SJIS
        size-eos: true
        if: (code_type == 0x00150050) or (code_type & 0x0000FFFF) == 0
      - id: raw
        size-eos: true