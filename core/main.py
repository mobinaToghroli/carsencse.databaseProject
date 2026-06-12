from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import os

from users.routes import router as users_router
from vehicles.routes import router as vehicles_router
from reports.routes import router as reports_router
from responses.routes import router as responses_router
from reviews.routes import router as reviews_router
from mechanics.routes import router as mechanics_router
from admin.routes import router as admin_router
from attachments.routes import router as attachments_router
from notifications.routes import router as notifications_router
from about.routes import router as about_router
from core.config import settings
from fastapi.encoders import jsonable_encoder


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print("✅ Mechanic Platform API started")
    yield
    print("🛑 Mechanic Platform API stopped")


app = FastAPI(
    title="Mechanic Platform API",
    description="سامانه ارتباط کاربر و مکانیک — ثبت مشکل، پاسخ‌دهی، امتیازدهی",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # در production محدود کن
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({
            "error": True,
            "status_code": 422,
            "detail": exc.errors(),
        }),
    )



"""@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": True, "status_code": 422, "detail": exc.errors()},
    )
"""

# ─── Process Time Middleware ───────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(round(time.perf_counter() - start, 4))
    return response


# ─── Static files (uploaded media) ────────────────────────────────────────────
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ─── Routers ──────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(users_router,         prefix=PREFIX)
app.include_router(vehicles_router,      prefix=PREFIX)
app.include_router(reports_router,       prefix=PREFIX)
app.include_router(responses_router,     prefix=PREFIX)
app.include_router(reviews_router,       prefix=PREFIX)
app.include_router(mechanics_router,     prefix=PREFIX)
app.include_router(admin_router,         prefix=PREFIX)
app.include_router(attachments_router,   prefix=PREFIX)
app.include_router(notifications_router, prefix=PREFIX)
app.include_router(about_router,         prefix=PREFIX)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "mechanic-platform", "version": "2.0.0"}
