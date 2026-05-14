import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageGenerator from './ImageGenerator'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ImageGenerator Warm Premium Errors', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should display a warm premium message when API returns 503 (service unavailable)', async () => {
    // 1. Setup mock for 503 error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Service Unavailable' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<ImageGenerator />)

    // 2. Trigger generation
    const textarea = screen.getByPlaceholderText(/un paisaje cyberpunk/i)
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    const button = screen.getByRole('button', { name: /generar imagen/i })
    fireEvent.click(button)

    // 3. Verify warm error message
    // Use findByText which has built-in retry and wait
    const errorTitle = await screen.findByText(/algo no salió como esperábamos/i, {}, { timeout: 5000 })
    expect(errorTitle).toBeInTheDocument()
    
    expect(screen.getByText(/motor creativo está tomando un respiro/i)).toBeInTheDocument()

    // Check for warm colors (amber classes)
    const errorContainer = errorTitle.closest('div')?.parentElement
    expect(errorContainer).toHaveClass('border-amber-500/20')
  })
})
