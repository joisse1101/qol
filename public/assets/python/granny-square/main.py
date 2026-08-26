import js  # type: ignore
from pyodide.ffi import create_proxy, to_js  # type: ignore
from pyodide.http import pyfetch  # type: ignore
import asyncio
import builtins

# Fetch missing modules dynamically into Pyodide's filesystem
async def load_dependencies():
    files = [
        ("granny_square.py", "/assets/python/granny-square/granny_square.py"),
        ("diagonal_grid.py", "/assets/python/granny-square/diagonal_grid.py"),
    ]
    for local_name, url in files:
        response = await pyfetch(url)
        content = await response.string()
        with open(local_name, "w") as f:
            f.write(content)


asyncio.run(load_dependencies())

# Import modules after loading
from granny_square import PatternedColouredGrannySquare


def custom_print(*args, **kwargs):
    string_list = [str(arg) for arg in args]
    js.window.addLogs(to_js(string_list))


builtins.print = custom_print

async def generate_square(grid_size, palette, num_patterns, curr_pattern_grid=None):
    try:
        granny_square = await PatternedColouredGrannySquare.create(
            grid_size, list(palette), num_patterns, curr_pattern_grid
        )
        colour_grid, pattern_grid = await granny_square.get_granny_square_data()

        return to_js({"colourGrid": colour_grid, "patternGrid": pattern_grid})
    except Exception as e:
        print(f"Error generating granny square: {e}")
        import traceback    
        print(traceback.format_exc())
        return to_js({"colourGrid": [], "patternGrid": []})


js.window.generateGrannySquare = create_proxy(generate_square)

event = js.Event.new("py-app-ready")
js.document.dispatchEvent(event)
