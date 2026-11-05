// Headline split into words that rise in one after another.
export default function Split({ text, as: Tag = 'h2', className, children }) {
  let i = 0
  return (
    <Tag className={(className ? className + ' ' : '') + 'split rv'}>
      {children}
      {text.split(' ').map((w, k) => (
        <span key={k}>
          {k > 0 && ' '}
          <span className="w"><span style={{ '--i': i++ }}>{w}</span></span>
        </span>
      ))}
    </Tag>
  )
}
