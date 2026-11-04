package com.themeos.launcher

import android.content.Context
import android.graphics.Color
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject

class ThemeError(val code: String, message: String) : Exception(message)

/**
 * Day-3 version: lists bundled themes (assets/themes/<dir>/theme.json), does minimal
 * validation, persists the active theme ID. The full validator + wallpaper/icons are Wednesday's work.
 */
object ThemeRepository {
    private const val PREFS = "themeos"
    private const val KEY_ACTIVE = "active_theme_id"
    private val ID_REGEX = Regex("^[a-z0-9-]+$")

    fun listThemes(ctx: Context): JSONArray {
        val out = JSONArray()
        val dirs = ctx.assets.list("themes") ?: emptyArray()
        for (dir in dirs) {
            try {
                val text = ctx.assets.open("themes/$dir/theme.json").bufferedReader().use { it.readText() }
                val json = JSONObject(text)
                validate(json)
                json.put("dir", dir)
                out.put(json)
            } catch (e: Exception) {
                Log.w("ThemeOS", "Skipping invalid theme '$dir': ${e.message}")
            }
        }
        return out
    }

    fun getActive(ctx: Context): JSONObject? {
        val id = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ACTIVE, null) ?: return null
        val themes = listThemes(ctx)
        for (i in 0 until themes.length()) {
            val t = themes.getJSONObject(i)
            if (t.getString("id") == id) return t
        }
        return null // stale/invalid id -> caller falls back to default look
    }

    fun apply(ctx: Context, themeId: String): JSONObject {
        if (!ID_REGEX.matches(themeId)) throw ThemeError("INVALID_ID", "Bad theme id")
        val themes = listThemes(ctx)
        for (i in 0 until themes.length()) {
            val t = themes.getJSONObject(i)
            if (t.getString("id") == themeId) {
                ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_ACTIVE, themeId).apply()
                return t
            }
        }
        // Previous active theme is untouched on failure
        throw ThemeError("THEME_NOT_FOUND_OR_INVALID", "Theme '$themeId' is missing or failed validation")
    }

    private fun validate(j: JSONObject) {
        if (j.optInt("schemaVersion", -1) != 1) throw ThemeError("SCHEMA", "Unsupported schemaVersion")
        if (!ID_REGEX.matches(j.optString("id"))) throw ThemeError("SCHEMA", "Bad id")
        for (k in listOf("name", "version", "wallpaper")) if (j.optString(k).isEmpty()) throw ThemeError("SCHEMA", "Missing $k")
        val a = j.optJSONObject("appearance") ?: throw ThemeError("SCHEMA", "Missing appearance")
        for (k in listOf("background", "surface", "primary", "text")) Color.parseColor(a.getString(k))
        val l = j.optJSONObject("layout") ?: throw ThemeError("SCHEMA", "Missing layout")
        if (l.getInt("columns") !in 3..6) throw ThemeError("SCHEMA", "columns must be 3-6")
        val wp = j.getString("wallpaper")
        if (wp.contains("..") || wp.startsWith("/")) throw ThemeError("PATH", "Unsafe path")
    }
}
