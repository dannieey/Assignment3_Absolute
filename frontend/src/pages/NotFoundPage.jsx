import { Link } from 'react-router-dom'
import { Container } from '../components/Container'

export function NotFoundPage() {
  return (
    <div className="bg-slate-50">
      <Container className="py-16">
        <div className="text-3xl font-extrabold text-slate-900">Page not found</div>
        <div className="mt-2 text-slate-600">The page you’re looking for doesn’t exist.</div>
        <Link to="/" className="inline-flex mt-6 px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
          Go home
        </Link>
      </Container>
    </div>
  )
}

