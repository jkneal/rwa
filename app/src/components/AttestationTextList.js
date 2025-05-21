import React from 'react'

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

export const AttestationTextList = ({ text, id }) => {
    let markup = md.render(text || '')
    markup = markup.replaceAll('<a ', '<a target="_blank" ')

    return <div id={id || 'attestation-text-list'} dangerouslySetInnerHTML={{ __html: markup}} />
}
