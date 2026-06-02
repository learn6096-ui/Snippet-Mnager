import { User, Snippet, SnippetVersion, Comparison } from '../types';

// Mock Users
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'devmaster',
    email: 'dev@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devmaster',
  },
];

// Mock Snippets
const mockSnippets: Snippet[] = [
  {
    id: 'snip-1',
    userId: 'user-1',
    title: 'React useDebounce Hook',
    description: 'A custom debounce hook for React inputs with configurable delay.',
    language: 'typescript',
    createdAt: '2026-04-10T09:00:00Z',
    updatedAt: '2026-05-15T14:30:00Z',
    latestVersion: 3,
  },
  {
    id: 'snip-2',
    userId: 'user-1',
    title: 'Python FastAPI Auth Middleware',
    description: 'JWT-based authentication middleware for FastAPI applications.',
    language: 'python',
    createdAt: '2026-03-22T11:00:00Z',
    updatedAt: '2026-05-10T16:45:00Z',
    latestVersion: 4,
  },
  {
    id: 'snip-3',
    userId: 'user-1',
    title: 'Binary Search Implementation',
    description: 'Classic binary search with iterative and recursive approaches.',
    language: 'java',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
    latestVersion: 2,
  },
  {
    id: 'snip-4',
    userId: 'user-1',
    title: 'Express Rate Limiter',
    description: 'Redis-backed rate limiting middleware for Express.js APIs.',
    language: 'javascript',
    createdAt: '2026-01-05T13:00:00Z',
    updatedAt: '2026-05-01T09:15:00Z',
    latestVersion: 5,
  },
  {
    id: 'snip-5',
    userId: 'user-1',
    title: 'Rust HTTP Server',
    description: 'Minimal HTTP server built with Tokio and Hyper.',
    language: 'rust',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-05-12T11:00:00Z',
    latestVersion: 3,
  },
  {
    id: 'snip-6',
    userId: 'user-1',
    title: 'CSS Grid Dashboard Layout',
    description: 'Responsive dashboard layout using CSS Grid with auto-fit columns.',
    language: 'css',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-04-28T15:30:00Z',
    latestVersion: 2,
  },
  {
    id: 'snip-7',
    userId: 'user-1',
    title: 'Go Goroutine Pool',
    description: 'Worker pool pattern implementation using goroutines and channels.',
    language: 'go',
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-05-08T12:00:00Z',
    latestVersion: 3,
  },
  {
    id: 'snip-8',
    userId: 'user-1',
    title: 'SQL Window Functions',
    description: 'Collection of useful window functions for analytics queries.',
    language: 'sql',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-03-30T14:00:00Z',
    latestVersion: 2,
  },
  {
    id: 'snip-9',
    userId: 'user-1',
    title: 'TypeScript Zod Validator',
    description: 'Reusable form validation schemas using Zod with TypeScript inference.',
    language: 'typescript',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-18T16:00:00Z',
    latestVersion: 2,
  },
  {
    id: 'snip-10',
    userId: 'user-1',
    title: 'C++ Smart Pointer',
    description: 'Custom unique_ptr implementation for learning purposes.',
    language: 'cpp',
    createdAt: '2026-04-05T11:00:00Z',
    updatedAt: '2026-05-14T09:00:00Z',
    latestVersion: 2,
  },
  {
    id: 'snip-11',
    userId: 'user-1',
    title: 'HTML Email Template',
    description: 'Responsive HTML email template with inline styles for cross-client support.',
    language: 'html',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
    latestVersion: 2,
  },
];

// Mock Versions for each snippet
const mockVersions: Record<string, SnippetVersion[]> = {
  'snip-1': [
    {
      id: 'ver-1-1',
      snippetId: 'snip-1',
      version: 1,
      code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
      commitMessage: 'Initial implementation of useDebounce hook',
      createdAt: '2026-04-10T09:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-1-2',
      snippetId: 'snip-1',
      version: 2,
      code: `import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Added a callback version for event handlers
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  ) as T;
}`,
      commitMessage: 'Add useDebounceFn for event handler debouncing',
      createdAt: '2026-05-01T11:30:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-1-3',
      snippetId: 'snip-1',
      version: 3,
      code: `import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  ) as T;
}`,
      commitMessage: 'Fix stale closure in useDebounceFn with ref',
      createdAt: '2026-05-15T14:30:00Z',
      author: 'devmaster',
    },
  ],
  'snip-2': [
    {
      id: 'ver-2-1',
      snippetId: 'snip-2',
      version: 1,
      code: `from fastapi import Request, HTTPException
from jose import jwt

SECRET_KEY = "your-secret-key"

async def auth_middleware(request: Request, call_next):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(token.replace("Bearer ", ""), SECRET_KEY, algorithms=["HS256"])
        request.state.user = payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    return await call_next(request)`,
      commitMessage: 'Initial auth middleware with JWT validation',
      createdAt: '2026-03-22T11:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-2-2',
      snippetId: 'snip-2',
      version: 2,
      code: `from fastapi import Request, HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import os

SECRET_KEY = os.getenv("JWT_SECRET", "fallback-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def auth_middleware(request: Request, call_next):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(
            token.replace("Bearer ", ""),
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        request.state.user = payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    return await call_next(request)`,
      commitMessage: 'Add token creation helper and env-based secret',
      createdAt: '2026-04-05T09:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-2-3',
      snippetId: 'snip-2',
      version: 3,
      code: `from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
import os

SECRET_KEY = os.getenv("JWT_SECRET", "fallback-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class TokenPayload(BaseModel):
    sub: str
    roles: List[str] = []
    exp: datetime

class AuthConfig:
    """Configurable auth settings"""
    exclude_paths: List[str] = ["/health", "/docs", "/openapi.json"]
    required_roles: dict = {}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def auth_middleware(request: Request, call_next):
    if request.url.path in AuthConfig.exclude_paths:
        return await call_next(request)

    try:
        user = await get_current_user(request)
        request.state.user = user
    except HTTPException:
        raise

    return await call_next(request)`,
      commitMessage: 'Refactor with Pydantic models and configurable paths',
      createdAt: '2026-04-20T14:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-2-4',
      snippetId: 'snip-2',
      version: 4,
      code: `from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
from functools import lru_cache
import os

class Settings(BaseModel):
    jwt_secret: str = os.getenv("JWT_SECRET", "fallback-secret-key")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    exclude_paths: List[str] = ["/health", "/docs", "/openapi.json"]

@lru_cache
def get_settings() -> Settings:
    return Settings()

security = HTTPBearer()

class TokenPayload(BaseModel):
    sub: str
    roles: List[str] = []
    exp: datetime
    iat: Optional[datetime] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    settings = get_settings()
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.algorithm)

def create_refresh_token(data: dict) -> str:
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.algorithm)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.algorithm]
        )
        return TokenPayload(**payload)
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def require_roles(*roles: str):
    """Decorator to require specific roles for an endpoint"""
    async def role_checker(user: TokenPayload = Depends(get_current_user)):
        if not any(r in user.roles for r in roles):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

async def auth_middleware(request: Request, call_next):
    settings = get_settings()
    if request.url.path in settings.exclude_paths:
        return await call_next(request)
    try:
        user = await get_current_user(request)
        request.state.user = user
    except HTTPException:
        raise
    return await call_next(request)`,
      commitMessage: 'Add refresh tokens, role-based access, and Settings config',
      createdAt: '2026-05-10T16:45:00Z',
      author: 'devmaster',
    },
  ],
  'snip-3': [
    {
      id: 'ver-3-1',
      snippetId: 'snip-3',
      version: 1,
      code: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
      commitMessage: 'Initial iterative binary search',
      createdAt: '2026-02-15T08:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-3-2',
      snippetId: 'snip-3',
      version: 2,
      code: `public class BinarySearch {
    // Iterative approach
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    // Recursive approach
    public static int searchRecursive(int[] arr, int target, int left, int right) {
        if (left > right) return -1;
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) return searchRecursive(arr, target, mid + 1, right);
        return searchRecursive(arr, target, left, mid - 1);
    }

    // Generic version for Comparable types
    public static <T extends Comparable<T>> int search(T[] arr, T target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int cmp = arr[mid].compareTo(target);
            if (cmp == 0) return mid;
            if (cmp < 0) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 5, 7, 9, 11, 13};
        System.out.println("Found at index: " + search(nums, 7));
        System.out.println("Recursive at index: " + searchRecursive(nums, 7, 0, nums.length - 1));
    }
}`,
      commitMessage: 'Add recursive and generic Comparable versions',
      createdAt: '2026-04-20T10:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-4': [
    {
      id: 'ver-4-1',
      snippetId: 'snip-4',
      version: 1,
      code: `const rateLimit = (windowMs = 60000, max = 100) => {
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    const userHits = (hits.get(ip) || []).filter(t => t > windowStart);
    userHits.push(now);
    hits.set(ip, userHits);

    if (userHits.length > max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
};

module.exports = rateLimit;`,
      commitMessage: 'Simple in-memory rate limiter',
      createdAt: '2026-01-05T13:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-4-2',
      snippetId: 'snip-4',
      version: 2,
      code: `const Redis = require('ioredis');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    redisUrl = 'redis://localhost:6379',
    keyPrefix = 'rl:',
    message = 'Too many requests, please try again later.',
  } = options;

  const redis = new Redis(redisUrl);

  return async (req, res, next) => {
    const key = keyPrefix + (req.ip || req.socket.remoteAddress);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries and add current
      await redis.zremrangebyscore(key, 0, windowStart);
      await redis.zadd(key, now, now + ':' + Math.random());
      await redis.expire(key, Math.ceil(windowMs / 1000));

      const count = await redis.zcard(key);

      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', Math.max(0, max - count));
      res.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (count > max) {
        return res.status(429).json({ error: message });
      }
      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      next(); // Fail open
    }
  };
};

module.exports = createRateLimiter;`,
      commitMessage: 'Migrate to Redis-backed rate limiting',
      createdAt: '2026-02-10T09:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-4-3',
      snippetId: 'snip-4',
      version: 3,
      code: `const Redis = require('ioredis');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    redisUrl = 'redis://localhost:6379',
    keyPrefix = 'rl:',
    message = 'Too many requests, please try again later.',
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    handler = null,
  } = options;

  const redis = new Redis(redisUrl);

  const middleware = async (req, res, next) => {
    const key = keyPrefix + (req.ip || req.socket.remoteAddress);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now, \`\${now}:\${Math.random()}\`);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      pipeline.zcard(key);

      const results = await pipeline.exec();
      const count = results[results.length - 1][1];

      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
      res.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (count > max) {
        if (handler) return handler(req, res, next);
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }
      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      next();
    }
  };

  // Expose reset method for testing
  middleware.reset = async (key) => {
    await redis.del(keyPrefix + key);
  };

  return middleware;
};

module.exports = createRateLimiter;`,
      commitMessage: 'Add pipeline batching, custom handler, and skip options',
      createdAt: '2026-03-20T11:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-4-4',
      snippetId: 'snip-4',
      version: 4,
      code: `const Redis = require('ioredis');

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.max = options.max || 100;
    this.keyPrefix = options.keyPrefix || 'rl:';
    this.message = options.message || 'Too many requests.';
    this.redis = new Redis(options.redisUrl || 'redis://localhost:6379');
    this.handler = options.handler || this.defaultHandler;
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
  }

  defaultHandler(req, res) {
    return res.status(429).json({ error: this.message });
  }

  middleware() {
    return async (req, res, next) => {
      const key = this.keyPrefix + this.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      try {
        const pipeline = this.redis.pipeline();
        pipeline.zremrangebyscore(key, 0, windowStart);
        pipeline.zadd(key, now, \`\${now}:\${Math.random()}\`);
        pipeline.expire(key, Math.ceil(this.windowMs / 1000));
        pipeline.zcard(key);

        const results = await pipeline.exec();
        const count = results[results.length - 1][1];

        res.set('X-RateLimit-Limit', String(this.max));
        res.set('X-RateLimit-Remaining', String(Math.max(0, this.max - count)));
        res.set('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

        if (count > this.max) {
          return this.handler(req, res, next);
        }
        next();
      } catch (err) {
        console.error('RateLimiter error:', err);
        next();
      }
    };
  }

  async reset(key) {
    await this.redis.del(this.keyPrefix + key);
  }

  async shutdown() {
    await this.redis.quit();
  }
}

// Factory function for backward compatibility
const createRateLimiter = (opts) => new RateLimiter(opts).middleware();

module.exports = { RateLimiter, createRateLimiter };`,
      commitMessage: 'Refactor to class-based API with factory function',
      createdAt: '2026-05-01T09:15:00Z',
      author: 'devmaster',
    },
  ],
  'snip-5': [
    {
      id: 'ver-5-1',
      snippetId: 'snip-5',
      version: 1,
      code: `use hyper::{Body, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use std::convert::Infallible;

async fn handle(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let body = Body::from("Hello, World!");
    Ok(Response::new(body))
}

#[tokio::main]
async fn main() {
    let make_svc = make_service_fn(|_conn| async {
        Ok::<_, Infallible>(service_fn(handle))
    });

    let addr = ([127, 0, 0, 1], 3000).into();
    let server = Server::bind(&addr).serve(make_svc);

    println!("Server running on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}`,
      commitMessage: 'Minimal Hyper HTTP server with Tokio',
      createdAt: '2026-04-01T10:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-5-2',
      snippetId: 'snip-5',
      version: 2,
      code: `use hyper::{Body, Method, Request, Response, Server, StatusCode};
use hyper::service::{make_service_fn, service_fn};
use std::convert::Infallible;
use std::collections::HashMap;

async fn handle(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let response = match (req.method(), req.uri().path()) {
        (&Method::GET, "/") => {
            Response::new(Body::from("Welcome to the Rust HTTP Server!"))
        }
        (&Method::GET, "/health") => {
            Response::new(Body::from(r#"{"status":"ok"}"#))
        }
        (&Method::GET, path) if path.starts_with("/api/") => {
            let body = serde_json::json!({
                "path": path,
                "method": "GET",
            });
            Response::builder()
                .header("Content-Type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap()
        }
        _ => {
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("Not Found"))
                .unwrap()
        }
    };
    Ok(response)
}

#[tokio::main]
async fn main() {
    let make_svc = make_service_fn(|_conn| async {
        Ok::<_, Infallible>(service_fn(handle))
    });

    let addr = ([0, 0, 0, 0], 3000).into();
    let server = Server::bind(&addr).serve(make_svc);

    println!("Server running on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}`,
      commitMessage: 'Add routing, JSON responses, and health endpoint',
      createdAt: '2026-04-25T10:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-5-3',
      snippetId: 'snip-5',
      version: 3,
      code: `use hyper::{Body, Method, Request, Response, Server, StatusCode};
use hyper::service::{make_service_fn, service_fn};
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppState {
    request_count: u64,
}

async fn handle(
    req: Request<Body>,
    state: Arc<RwLock<AppState>>,
) -> Result<Response<Body>, Infallible> {
    // Increment request counter
    {
        let mut s = state.write().await;
        s.request_count += 1;
    }

    let response = match (req.method(), req.uri().path()) {
        (&Method::GET, "/") => {
            Response::new(Body::from("Rust HTTP Server v0.3"))
        }
        (&Method::GET, "/health") => {
            let s = state.read().await;
            let body = serde_json::json!({
                "status": "ok",
                "requests": s.request_count,
            });
            Response::builder()
                .header("Content-Type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap()
        }
        (&Method::POST, "/echo") => {
            let body_bytes = hyper::body::to_bytes(req.into_body()).await.unwrap();
            Response::builder()
                .header("Content-Type", "application/json")
                .body(Body::from(body_bytes))
                .unwrap()
        }
        _ => {
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from(r#"{"error":"not found"}"#))
                .unwrap()
        }
    };
    Ok(response)
}

#[tokio::main]
async fn main() {
    let state = Arc::new(RwLock::new(AppState { request_count: 0 }));

    let make_svc = make_service_fn(move |_conn| {
        let state = state.clone();
        async move {
            Ok::<_, Infallible>(service_fn(move |req| {
                handle(req, state.clone())
            }))
        }
    });

    let addr = ([0, 0, 0, 0], 3000).into();
    let server = Server::bind(&addr).serve(make_svc);

    println!("Server running on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}`,
      commitMessage: 'Add shared state with request counter and echo endpoint',
      createdAt: '2026-05-12T11:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-6': [
    {
      id: 'ver-6-1',
      snippetId: 'snip-6',
      version: 1,
      code: `.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #313244;
}`,
      commitMessage: 'Initial dashboard grid layout',
      createdAt: '2026-03-10T14:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-6-2',
      snippetId: 'snip-6',
      version: 2,
      code: `.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  height: 100vh;
  gap: 0;
}

.dashboard__header {
  grid-area: header;
  background: #1e1e2e;
  border-bottom: 1px solid #313244;
  display: flex;
  align-items: center;
  padding: 0 2rem;
}

.dashboard__sidebar {
  grid-area: sidebar;
  background: #181825;
  border-right: 1px solid #313244;
  padding: 1.5rem;
  overflow-y: auto;
}

.dashboard__main {
  grid-area: main;
  padding: 2rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  align-content: start;
}

.card {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #313244;
  transition: border-color 0.2s, transform 0.2s;
}

.card:hover {
  border-color: #89b4fa;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 64px auto 1fr;
    grid-template-areas:
      "header"
      "sidebar"
      "main";
  }

  .dashboard__sidebar {
    border-right: none;
    border-bottom: 1px solid #313244;
    max-height: 200px;
  }
}`,
      commitMessage: 'Full dashboard layout with header, sidebar, and responsive design',
      createdAt: '2026-04-28T15:30:00Z',
      author: 'devmaster',
    },
  ],
  'snip-7': [
    {
      id: 'ver-7-1',
      snippetId: 'snip-7',
      version: 1,
      code: `package main

import (
\t"fmt"
\t"sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
\tdefer wg.Done()
\tfor job := range jobs {
\t\tfmt.Printf("Worker %d processing job %d\\n", id, job)
\t\tresults <- job * 2
\t}
}

func main() {
\tjobs := make(chan int, 100)
\tresults := make(chan int, 100)
\tvar wg sync.WaitGroup

\tfor i := 1; i <= 3; i++ {
\t\twg.Add(1)
\t\tgo worker(i, jobs, results, &wg)
\t}

\tfor j := 1; j <= 9; j++ {
\t\tjobs <- j
\t}
\tclose(jobs)

\twg.Wait()
\tclose(results)

\tfor r := range results {
\t\tfmt.Println("Result:", r)
\t}
}`,
      commitMessage: 'Basic worker pool with WaitGroup',
      createdAt: '2026-02-20T09:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-7-2',
      snippetId: 'snip-7',
      version: 2,
      code: `package main

import (
\t"context"
\t"fmt"
\t"sync"
\t"time"
)

type Pool struct {
\tworkers   int
\tjobQueue  chan func() error
\tresults   chan error
\tctx       context.Context
\tcancel    context.CancelFunc
\twg        sync.WaitGroup
}

func NewPool(workers int, queueSize int) *Pool {
\tctx, cancel := context.WithCancel(context.Background())
\treturn &Pool{
\t\tworkers:  workers,
\t\tjobQueue: make(chan func() error, queueSize),
\t\tresults:  make(chan error, queueSize),
\t\tctx:      ctx,
\t\tcancel:   cancel,
\t}
}

func (p *Pool) Start() {
\tfor i := 1; i <= p.workers; i++ {
\t\tp.wg.Add(1)
\t\tgo p.worker(i)
\t}
}

func (p *Pool) worker(id int) {
\tdefer p.wg.Done()
\tfor {
\t\tselect {
\t\tcase job, ok := <-p.jobQueue:
\t\t\tif !ok {
\t\t\t\treturn
\t\t\t}
\t\t\terr := job()
\t\t\tp.results <- err
\t\tcase <-p.ctx.Done():
\t\t\treturn
\t\t}
\t}
}

func (p *Pool) Submit(job func() error) {
\tp.jobQueue <- job
}

func (p *Pool) Shutdown() {
\tclose(p.jobQueue)
\tp.wg.Wait()
\tclose(p.results)
}

func main() {
\tpool := NewPool(3, 100)
\tpool.Start()

\tfor i := 1; i <= 9; i++ {
\t\tid := i
\t\tpool.Submit(func() error {
\t\t\tfmt.Printf("Processing job %d\\n", id)
\t\t\ttime.Sleep(100 * time.Millisecond)
\t\t\treturn nil
\t\t})
\t}

\tpool.Shutdown()
\tfmt.Println("All jobs completed")
}`,
      commitMessage: 'Refactor to reusable Pool struct with context support',
      createdAt: '2026-04-10T14:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-7-3',
      snippetId: 'snip-7',
      version: 3,
      code: `package main

import (
\t"context"
\t"fmt"
\t"sync"
\t"sync/atomic"
\t"time"
)

type Pool struct {
\tworkers    int
\tjobQueue   chan func() error
\tresults    chan error
\tctx        context.Context
\tcancel     context.CancelFunc
\twg         sync.WaitGroup
\tsubmitted  atomic.Int64
\tcompleted  atomic.Int64
\tfailed     atomic.Int64
}

type PoolStats struct {
\tSubmitted int64
\tCompleted int64
\tFailed    int64
}

func NewPool(workers int, queueSize int) *Pool {
\tctx, cancel := context.WithCancel(context.Background())
\treturn &Pool{
\t\tworkers:  workers,
\t\tjobQueue: make(chan func() error, queueSize),
\t\tresults:  make(chan error, queueSize),
\t\tctx:      ctx,
\t\tcancel:   cancel,
\t}
}

func (p *Pool) Start() {
\tfor i := 1; i <= p.workers; i++ {
\t\tp.wg.Add(1)
\t\tgo p.worker(i)
\t}
}

func (p *Pool) worker(id int) {
\tdefer p.wg.Done()
\tfor {
\t\tselect {
\t\tcase job, ok := <-p.jobQueue:
\t\t\tif !ok {
\t\t\t\treturn
\t\t\t}
\t\t\tif err := job(); err != nil {
\t\t\t\tp.failed.Add(1)
\t\t\t} else {
\t\t\t\tp.completed.Add(1)
\t\t\t}
\t\tcase <-p.ctx.Done():
\t\t\treturn
\t\t}
\t}
}

func (p *Pool) Submit(job func() error) {
\tp.submitted.Add(1)
\tp.jobQueue <- job
}

func (p *Pool) Stats() PoolStats {
\treturn PoolStats{
\t\tSubmitted: p.submitted.Load(),
\t\tCompleted: p.completed.Load(),
\t\tFailed:    p.failed.Load(),
\t}
}

func (p *Pool) Shutdown() {
\tclose(p.jobQueue)
\tp.wg.Wait()
\tclose(p.results)
}

func main() {
\tpool := NewPool(5, 100)
\tpool.Start()

\tfor i := 1; i <= 20; i++ {
\t\tid := i
\t\tpool.Submit(func() error {
\t\t\tfmt.Printf("Worker processing job %d\\n", id)
\t\t\ttime.Sleep(50 * time.Millisecond)
\t\t\tif id%7 == 0 {
\t\t\t\treturn fmt.Errorf("job %d failed", id)
\t\t\t}
\t\t\treturn nil
\t\t})
\t}

\ttime.Sleep(2 * time.Second)
\tstats := pool.Stats()
\tfmt.Printf("Stats: submitted=%d completed=%d failed=%d\\n",
\t\tstats.Submitted, stats.Completed, stats.Failed)
\tpool.Shutdown()
}`,
      commitMessage: 'Add atomic counters for pool statistics',
      createdAt: '2026-05-08T12:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-8': [
    {
      id: 'ver-8-1',
      snippetId: 'snip-8',
      version: 1,
      code: `-- Running total of sales
SELECT
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Rank employees by salary within department
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;`,
      commitMessage: 'Initial window function examples',
      createdAt: '2026-01-15T08:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-8-2',
      snippetId: 'snip-8',
      version: 2,
      code: `-- Running total of sales
SELECT
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Rank employees by salary within department
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_dept_rank,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num
FROM employees;

-- Moving average (last 7 days)
SELECT
    order_date,
    amount,
    AVG(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d
FROM daily_sales;

-- Lead/Lag for period comparison
SELECT
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS mom_change,
    ROUND(
        (revenue - LAG(revenue, 1) OVER (ORDER BY month)) * 100.0 /
        NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0), 2
    ) AS mom_pct
FROM monthly_revenue;

-- Percentile and distribution
SELECT
    name,
    salary,
    PERCENT_RANK() OVER (ORDER BY salary) AS percentile,
    NTILE(4) OVER (ORDER BY salary) AS quartile,
    CUME_DIST() OVER (ORDER BY salary) AS cumulative_dist
FROM employees;`,
      commitMessage: 'Add moving averages, lead/lag, and percentile functions',
      createdAt: '2026-03-30T14:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-9': [
    {
      id: 'ver-9-1',
      snippetId: 'snip-9',
      version: 1,
      code: `import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}`,
      commitMessage: 'Initial Zod validation schema for login',
      createdAt: '2026-05-01T10:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-9-2',
      snippetId: 'snip-9',
      version: 2,
      code: `import { z } from 'zod';

// Reusable field validators
const email = z.string().email('Invalid email address');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

const username = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores');

// Schemas
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username,
  email,
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  username,
  email,
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Inferred types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

// Validation helper
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return { success: false, errors };
}`,
      commitMessage: 'Add register/profile schemas and generic validate helper',
      createdAt: '2026-05-18T16:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-10': [
    {
      id: 'ver-10-1',
      snippetId: 'snip-10',
      version: 1,
      code: `#include <iostream>
#include <utility>

template <typename T>
class UniquePtr {
private:
    T* ptr_;

public:
    explicit UniquePtr(T* ptr = nullptr) : ptr_(ptr) {}

    ~UniquePtr() { delete ptr_; }

    // Delete copy
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    // Move semantics
    UniquePtr(UniquePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }

    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            delete ptr_;
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }

    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    T* get() const { return ptr_; }

    explicit operator bool() const { return ptr_ != nullptr; }
};

int main() {
    auto p = UniquePtr<int>(new int(42));
    std::cout << *p << std::endl;

    auto p2 = std::move(p);
    std::cout << *p2 << std::endl;
    std::cout << "p is null: " << (!p) << std::endl;
}`,
      commitMessage: 'Initial UniquePtr with RAII and move semantics',
      createdAt: '2026-04-05T11:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-10-2',
      snippetId: 'snip-10',
      version: 2,
      code: `#include <iostream>
#include <utility>
#include <cstddef>

template <typename T>
class UniquePtr {
private:
    T* ptr_;

public:
    explicit UniquePtr(T* ptr = nullptr) : ptr_(ptr) {}

    ~UniquePtr() { reset(); }

    // Delete copy
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    // Move semantics
    UniquePtr(UniquePtr&& other) noexcept : ptr_(other.release()) {}

    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            reset(other.release());
        }
        return *this;
    }

    // Observers
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    T* get() const { return ptr_; }
    explicit operator bool() const { return ptr_ != nullptr; }

    // Modifiers
    T* release() noexcept {
        T* old = ptr_;
        ptr_ = nullptr;
        return old;
    }

    void reset(T* ptr = nullptr) noexcept {
        T* old = ptr_;
        ptr_ = ptr;
        delete old;
    }

    void swap(UniquePtr& other) noexcept {
        std::swap(ptr_, other.ptr_);
    }
};

// Helper function (like std::make_unique)
template <typename T, typename... Args>
UniquePtr<T> makeUnique(Args&&... args) {
    return UniquePtr<T>(new T(std::forward<Args>(args)...));
}

struct Widget {
    int id;
    std::string name;
    Widget(int i, std::string n) : id(i), name(std::move(n)) {}
    ~Widget() { std::cout << "Widget " << id << " destroyed\\n"; }
};

int main() {
    auto p = makeUnique<Widget>(1, "Hello");
    std::cout << p->name << " (id=" << p->id << ")\\n";

    auto p2 = std::move(p);
    std::cout << "Moved to p2: " << p2->name << "\\n";

    p2.reset(new Widget(2, "World"));
    std::cout << "After reset: " << p2->name << "\\n";
}`,
      commitMessage: 'Add release/reset/swap, makeUnique helper, and Widget demo',
      createdAt: '2026-05-14T09:00:00Z',
      author: 'devmaster',
    },
  ],
  'snip-11': [
    {
      id: 'ver-11-1',
      snippetId: 'snip-11',
      version: 1,
      code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="padding:20px;text-align:center;background:#2563eb;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;">Welcome to Our Platform</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <p style="color:#333;font-size:16px;line-height:1.6;">
          Thanks for signing up! We're excited to have you on board.
        </p>
        <a href="#" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Get Started
        </a>
      </td>
    </tr>
  </table>
</body>
</html>`,
      commitMessage: 'Basic welcome email template',
      createdAt: '2026-03-01T09:00:00Z',
      author: 'devmaster',
    },
    {
      id: 'ver-11-2',
      snippetId: 'snip-11',
      version: 2,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:28px;font-weight:700;">
                Welcome to Our Platform
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;font-size:14px;">
                Your account is ready to go
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#333333;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;">
                Hi there,
              </p>
              <p style="margin:0 0 24px;color:#555555;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;">
                Thanks for joining us! Here's what you can do to get started:
              </p>
              <!-- Feature list -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:#f8f9fa;border-radius:6px;margin-bottom:8px;">
                    <p style="margin:0;color:#333;font-family:Arial,sans-serif;font-size:14px;">
                      &#10003; Complete your profile setup
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8f9fa;border-radius:6px;">
                    <p style="margin:0;color:#333;font-family:Arial,sans-serif;font-size:14px;">
                      &#10003; Explore the dashboard
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8f9fa;border-radius:6px;">
                    <p style="margin:0;color:#333;font-family:Arial,sans-serif;font-size:14px;">
                      &#10003; Create your first project
                    </p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:6px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
                    <a href="#" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8f9fa;border-top:1px solid #eeeeee;">
              <p style="margin:0;color:#999999;font-family:Arial,sans-serif;font-size:12px;text-align:center;">
                &copy; 2026 Your Company. All rights reserved.<br>
                <a href="#" style="color:#667eea;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      commitMessage: 'Professional responsive email template with cross-client support',
      createdAt: '2026-04-15T10:00:00Z',
      author: 'devmaster',
    },
  ],
};

// In-memory storage
let comparisons: Comparison[] = [];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions (mimicking Axios-style responses)
export const api = {
  // Auth
  async login(email: string, _password: string) {
    await delay(500);
    const user = mockUsers[0];
    return { data: { user, token: 'mock-jwt-token-' + Date.now() } };
  },

  async signup(username: string, email: string, _password: string) {
    await delay(600);
    const user: User = {
      id: 'user-' + Date.now(),
      username,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
    mockUsers.push(user);
    return { data: { user, token: 'mock-jwt-token-' + Date.now() } };
  },

  // Snippets
  async getSnippetsByUser(userId: string) {
    await delay(300);
    return { data: mockSnippets.filter(s => s.userId === userId) };
  },

  async getSnippet(snippetId: string) {
    await delay(200);
    const snippet = mockSnippets.find(s => s.id === snippetId);
    return { data: snippet || null };
  },

  // Versions
  async getVersions(snippetId: string) {
    await delay(300);
    return { data: mockVersions[snippetId] || [] };
  },

  async createVersion(snippetId: string, commitMessage: string, code: string) {
    await delay(400);
    const versions = mockVersions[snippetId] || [];
    const newVersion: SnippetVersion = {
      id: `ver-${snippetId}-${versions.length + 1}`,
      snippetId,
      version: versions.length + 1,
      code,
      commitMessage,
      createdAt: new Date().toISOString(),
      author: 'devmaster',
    };
    if (!mockVersions[snippetId]) {
      mockVersions[snippetId] = [];
    }
    mockVersions[snippetId].push(newVersion);

    // Update snippet's latestVersion
    const snippet = mockSnippets.find(s => s.id === snippetId);
    if (snippet) {
      snippet.latestVersion = newVersion.version;
      snippet.updatedAt = newVersion.createdAt;
    }

    return { data: newVersion };
  },

  // Create a brand-new snippet with its first version (v1)
  async createSnippet(
    userId: string,
    title: string,
    description: string,
    language: string,
    initialCode: string,
    commitMessage: string,
  ) {
    await delay(500);
    const id = 'snip-' + Date.now();
    const now = new Date().toISOString();

    // ── Trigger TRG-3 simulation: normalise language to lowercase ──
    const normalisedLanguage = language.toLowerCase().trim();

    const snippet: Snippet = {
      id,
      userId,
      title,
      description,
      language: normalisedLanguage,
      createdAt: now,
      updatedAt: now,
      latestVersion: 1,
    };
    mockSnippets.unshift(snippet); // newest-first (mirrors ORDER BY created_at DESC)

    // ── Trigger TRG-2 simulation: first version must be v1 ──
    const firstVersion: SnippetVersion = {
      id: `ver-${id}-1`,
      snippetId: id,
      version: 1,                // enforced: version_number = 1 for root
      code: initialCode,
      commitMessage: commitMessage || 'Initial commit',
      createdAt: now,
      author: mockUsers[0]?.username ?? 'unknown',
    };
    mockVersions[id] = [firstVersion];

    return { data: { snippet, version: firstVersion } };
  },

  // Comparisons
  async createComparison(snippetId: string, versionAId: string, versionBId: string) {
    await delay(200);
    const comparison: Comparison = {
      id: 'cmp-' + Date.now(),
      snippetId,
      versionAId,
      versionBId,
      createdAt: new Date().toISOString(),
    };
    comparisons.push(comparison);
    return { data: comparison };
  },

  // Delete a snippet and all its versions/comparisons
  // Simulates TRG-1/TRG-2/TRG-4: cascading deletes
  async deleteSnippet(snippetId: string) {
    await delay(350);
    const idx = mockSnippets.findIndex(s => s.id === snippetId);
    if (idx === -1) throw new Error(`Snippet ${snippetId} not found`);
    mockSnippets.splice(idx, 1);           // remove snippet
    delete mockVersions[snippetId];        // cascade: remove its versions
    // cascade: remove comparisons referencing this snippet's versions
    const versionsOfSnippet = Object.keys(mockVersions).filter(k => k === snippetId);
    comparisons.splice(0, comparisons.length,
      ...comparisons.filter(c => !versionsOfSnippet.some(id => c.snippetId === id))
    );
    return { data: { deleted: true, snippetId } };
  },
};
